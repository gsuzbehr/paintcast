const Alexa = require('ask-sdk-core');

// 1. Text strings ================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

const welcomeOutput = "Welcome to Paint Cast by Behr.  I can help you with your project.  What city do you live in?";
const welcomeReprompt = "I can help you with your project.  What city do you live in?";
const helpOutput = 'You can start by asking "is today a good day to start my project".';
const helpReprompt = 'Try saying "is today a good day to start my project".';


// 1. Intent Handlers =============================================

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    return responseBuilder
      .speak(welcomeOutput)
      .reprompt(welcomeReprompt)
      .getResponse();
  },
};

const InProgressPlanMyProjectHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'PlanMyProjectIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

const CompletedPlanMyProjectHandler = {
  canHandle(handlerInput) {
    console.log("CompletedPlanMyProjectHandler 1");
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'PlanMyProjectIntent';
  },
  async handle(handlerInput) {
    console.log('Plan My Trip - handle');

    const responseBuilder = handlerInput.responseBuilder;
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);
    console.log("CompletedPlanMyProjectHandler 2");


    const cityName = slotValues.projectCity.synonym;
    const startDate = slotValues.projectDate.synonym;
    const selectedProject = slotValues.projectType.synonym;

    let weatherAPIUrl = `http://api.openweathermap.org/data/2.5/forecast?appid=c5c5f37bd77009ef9dd19707a10277f1&units=imperial&CNT=5&q=${cityName},us`;
    let currentTemperature = '';
    let outputSpeech = '';
    let minTemp = 40;
    let maxTemp = 90;
    let mainWeather = 'Clear';
    var projectBoolean = 1;  //0 is false
    var newDate = new Date();
    var todaysDate = newDate.getDate();
    var startDayNumber = startDate.substring(8, 10);
  

    console.log("cityName: " + cityName);
    console.log("startDate: " + startDate);
    console.log("day: " + startDate.substring(8, 10));
    console.log("todays date: " + todaysDate);
    console.log("selectedProject: " + selectedProject);
    console.log("weatherAPIUrl: " + weatherAPIUrl);
    console.log("project boolean: " + Boolean(projectBoolean));








    await getRemoteData(weatherAPIUrl).then((response) => {
      const data = JSON.parse(response);

      let cityName = data.city.name;
      let day1 = '';
      let day2 = '';
      let day3 = '';
      let day4 = '';
      let day5 = '';

      //search date - actual date = index number
      var index = 0;

      console.log("startDayNumber: " + startDayNumber);
      console.log("todaysDate: " + todaysDate);

      if (startDayNumber > todaysDate) {
        index = startDayNumber - todaysDate;
      }

      
      console.log("index: " + index);

      currentTemperature = data.list[index].main.temp;


      //outputSpeech = "Today is : " + currentDay + ".  Your city is " + cityName;
      console.log("CompletedPlanMyProjectHandler 3");
      console.log("data: " + data);
      console.log("data.list[0].main.temp: " + data.list[index].main.temp);
      console.log("data.list[0].weather[0].main: " + data.list[index].weather[0].main);
      console.log("date: " + slotValues.projectDate.synonym);

      mainWeather = data.list[index].weather[0].main;

      if (mainWeather == 'Rain' || mainWeather == 'Snow' || mainWeather == 'Thunderstorm') {
        console.log("we should not start the project");
        projectBoolean = 0;
      }

      if (selectedProject == 'stain') {
        minTemp = 40;
        maxTemp = 90;
      } else {
        minTemp = 50;
        maxTemp = 90;
      }


      if (Boolean(projectBoolean)) {
        if ((data.list[index].main.temp > minTemp) || (data.list[index].main.temp < maxTemp)) {
          console.log("CompletedPlanMyProjectHandler 4");
          outputSpeech = `The temperature in ${cityName} is ${currentTemperature} degrees fahrenheit.  Congratulations, you can start your ${selectedProject} project!`;
        } else {
          console.log("CompletedPlanMyProjectHandler 5");
          outputSpeech = `Sorry.  It is ${currentTemperature} degrees fahrenheit and it is not a great time to paint.`
        }
      } else {
        outputSpeech = `Sorry.  The forecast will be ${mainWeather}.  The date you selected is not a good day to start your project.`
      }



    })
    .catch((err) => {
      //set an optional error message here
      console.log("err: " + err);

      if (err.toString().includes("404")) {
        outputSpeech = `I am sorry.  I did not find ${cityName} in my search.`;
        //outputSpeech = err.message;
      }

    });













    console.log("CompletedPlanMyProjectHandler 6");








    return responseBuilder
      .speak(outputSpeech)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    return responseBuilder
      .speak(helpOutput)
      .reprompt(helpReprompt)
      .getResponse();
  },
};

const CancelStopHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    const speechOutput = 'Okay, talk to you later! ';

    return responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const request = handlerInput.requestEnvelope.request;

    console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);
    console.log(`Error handled: ${error}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can not understand the command.  Please say again.')
      .reprompt('Sorry, I can not understand the command.  Please say again.')
      .getResponse();
  },
};

// 2. Helper Functions ============================================================================

function getSlotValues(filledSlots) {
  const slotValues = {};

  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
      };
    }
  }, this);

  return slotValues;
}

function getRandomPhrase(array) {
  // the argument is an array [] of words or phrases
  const i = Math.floor(Math.random() * array.length);
  return (array[i]);
}

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  })
};

// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressPlanMyProjectHandler,
    CompletedPlanMyProjectHandler,
    CancelStopHandler,
    HelpHandler,
    SessionEndedHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
