/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log('LaunchRequestHandler');
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    /**
    const speechText = 'Hello there. What is your name?';
    const repromptText = 'Can you tell me your name?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard('Example Card Title', "Example card body content.")
      .getResponse();
    **/
    const speechText = 'Welcome to Paint Cast by Behr. I can help you with your coatings project. What city do you live in?';
    const speechReprompt = 'What city do you live in?';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechReprompt)
      .getResponse();
  },
};

const CityIntetHandler = {
  canHandle(handlerInput) {
    console.log('CityIntetHandler');
    const request = handlerInput.requestEnvelope.request;
    console.log("CityIntetHandler request.intent.slots.cityName.value: " + handlerInput.requestEnvelope.request.intent.slots.cityName.value);
    console.log("CityIntetHandler request.intent.name: " + handlerInput.requestEnvelope.request.intent.name);
    console.log("CityIntetHandler request.dialogState: " + handlerInput.requestEnvelope.request.dialogState);
    console.log("CityIntetHandler 1");

    return request.type === 'IntentRequest'
      && request.intent.name === 'CityIntent'
      && request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    let prompt = '';
    console.log("CityIntetHandler 2");

    for (const slotName in currentIntent.slots) {
      console.log("CityIntetHandler 3");

      if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
        console.log("CityIntetHandler 4");
        const currentSlot = currentIntent.slots[slotName];
        console.log("CityIntentHandler currentIntent.slots.cityName: " + currentIntent.slots.cityName.value);

        if (currentSlot.confirmationStatus !== 'CONFIRMED') {
          console.log("CityIntetHandler 5");
          console.log("CityIntetHandler not confirmed");
        } else {
          console.log("CityIntetHandler 6");
          console.log("CityIntetHandler confirmed");
        }


      }
    }

    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

const CompletedCityMatchIntent = {
  canHandle(handlerInput) {
    console.log('CompletedCityMatchIntent');
    const request = handlerInput.requestEnvelope.request;
    console.log("CityIntetHandler request.intent.slots.cityName.value: " + handlerInput.requestEnvelope.request.intent.slots.cityName.value);
    console.log("CompletedCityMatchIntent request.intent.name: " + handlerInput.requestEnvelope.request.intent.name);
    console.log("CompletedCityMatchIntent request.dialogState: " + handlerInput.requestEnvelope.request.dialogState);
    console.log("CompletedCityMatchIntent 1");

    return request.type === 'IntentRequest'
      && request.intent.name === 'CityIntent'
      && request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);
    const cityIntentName = handlerInput.requestEnvelope.request.intent.slots.cityName.value;
    var currentDay = new Date().getDay();

    let weatherAPIUrl = `http://api.openweathermap.org/data/2.5/forecast?appid=c5c5f37bd77009ef9dd19707a10277f1&units=imperial&CNT=5&q=${cityIntentName},us`;
    let outputSpeech = cityIntentName;
    //const cityMatchOptions = buildPetMatchOptions(slotValues);

    console.log("CompletedCityMatchIntent 2");
    console.log("weatherAPIUrl: " + weatherAPIUrl);
    console.log("currentDay: " + currentDay);

    await getRemoteData(weatherAPIUrl).then((response) => {
      const data = JSON.parse(response);

      let cityName = data.city.name;
      let day1 = '';
      let day2 = '';
      let day3 = '';
      let day4 = '';
      let day5 = '';

      if (currentDay == 1) {
        currentDay = 'Sunday';
      } else if (currentDay == 2) {
        currentDay = 'Monday';
      } else if (currentDay == 3) {
        currentDay = 'Tuesday';
      } else if (currentDay == 4) {
        currentDay = 'Wednesday';
      } else if (currentDay == 5) {
        currentDay = 'Thursday';
      } else if (currentDay == 6) {
        currentDay = 'Friday';
      } else if (currentDay == 7) {
        currentDay = 'Saturday';
      }

      outputSpeech = "Today is : " + currentDay + ".  Your city is " + cityName;

      if ((data.main.temp > 50) || (data.main.temp > 90)) {
        outputSpeech = `You live in ${data.name} and the current temperature is ${data.main.temp} degrees fahrenheit.  Congratulations, you can paint today!`;
      } else {
        outputSpeech = `Sorry.  It is ${data.main.temp} degrees fahrenheit and it is not a great time to paint.`
      }

    })
    .catch((err) => {
      //set an optional error message here
      //outputSpeech = err.message;
    });



    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();
  },
};

const MyNameIsIntentHandler = {
  canHandle(handlerInput) {
    console.log('MyNameIsIntentHandler');
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MyNameIsIntent';
  },
  handle(handlerInput) {

    const nameSlot = handlerInput.requestEnvelope.request.intent.slots.name.value;
    const speechText = `Hello ${nameSlot}. It's nice to meet you.`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    console.log('');
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    console.log('');
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log('');
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
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
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function getSlotValues(filledSlots) {
  const slotValues = {};
  console.log("getSlotValues");
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
        console.log("getSlotValues ER_SUCCESS_MATCH");
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
        console.log("getSlotValues ER_SUCCESS_NO_MATCH");
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

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    CityIntetHandler,
    CompletedCityMatchIntent,
    MyNameIsIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
