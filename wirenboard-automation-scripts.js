// =============================================
// WirenBoard Automation Scripts Portfolio
// Автор: Денис
// Дата: 2024
// =============================================

/*
 * 1. ВЫТЯЖКА В ВАННОЙ
 * Управление по кнопке: короткое нажатие - вкл/выкл, 
 * длинное нажатие (>1.5 сек) - включение на 10 минут
 */
var bathroomFanTimer = null;
var bathroomPressTime = 0;
var LONG_PRESS = 1500;

defineRule("BathroomFanPress", {
  whenChanged: "wb-mr6c_31/IN2",
  then: function(newValue) {
    if (newValue) {
      bathroomPressTime = Date.now();
    } else {
      var dt = Date.now() - bathroomPressTime;
      if (dt > LONG_PRESS) {
        dev["wb-mr6c_31"]["K2"] = true;
        if (bathroomFanTimer) clearTimeout(bathroomFanTimer);
        bathroomFanTimer = setTimeout(function() {
          dev["wb-mr6c_31"]["K2"] = false;
          bathroomFanTimer = null;
        }, 10 * 60 * 1000);
      } else {
        if (bathroomFanTimer) {
          clearTimeout(bathroomFanTimer);
          bathroomFanTimer = null;
        }
        dev["wb-mr6c_31"]["K2"] = !dev["wb-mr6c_31"]["K2"];
      }
    }
  }
});

/*
 * 2. ОТКЛЮЧЕНИЕ РЕЛЕ В СПАЛЬНЕ ПО ДВУМ КНОПКАМ
 * Кнопка 1: отключает точечный свет и люстру
 * Кнопка 2: отключает подшторную нишу, световую линию и зеркало
 */
defineRule("bedroom_btn_1_off", {
  whenChanged: "wb-mr6c_31/Input 6",
  then: function(newValue) {
    if (newValue) {
      dev["wb-mr6c_28/K6"] = false;
      dev["wb-mr6c_28/K1"] = false;
      log("Спальня: выключены точечный свет и люстра");
    }
  }
});

defineRule("bedroom_btn_2_off", {
  whenChanged: "wb-mr6c_31/Input 5",
  then: function(newValue) {
    if (newValue) {
      dev["wb-mr6c_28/K2"] = false;
      dev["wb-mr6c_28/K3"] = false;
      dev["wb-mr6c_234/K3"] = false;
      log("Спальня: выключены ниша, линия, зеркало");
    }
  }
});

/*
 * 3. ВЫТЯЖКА В ТУАЛЕТЕ
 * Аналогичное управление как в ванной
 */
var toiletFanTimer = null;
var toiletPressTime = 0;

defineRule("ToiletFanPress", {
  whenChanged: "wb-mr6c_207/IN2",
  then: function(newValue) {
    if (newValue) {
      toiletPressTime = Date.now();
    } else {
      var dt = Date.now() - toiletPressTime;
      if (dt > LONG_PRESS) {
        dev["wb-mr6c_207"]["K2"] = true;
        if (toiletFanTimer) clearTimeout(toiletFanTimer);
        toiletFanTimer = setTimeout(function() {
          dev["wb-mr6c_207"]["K2"] = false;
          toiletFanTimer = null;
        }, 10 * 60 * 1000);
      } else {
        if (toiletFanTimer) {
          clearTimeout(toiletFanTimer);
          toiletFanTimer = null;
        }
        dev["wb-mr6c_207"]["K2"] = !dev["wb-mr6c_207"]["K2"];
      }
    }
  }
});

/*
 * 4. ВЫТЯЖКА В ГАРДЕРОБЕ
 * Аналогичное управление
 */
var garderobFanTimer = null;
var garderobPressTime = 0;

defineRule("GarderobFanPress", {
  whenChanged: "wb-mr6c_234/IN3",
  then: function(newValue) {
    if (newValue) {
      garderobPressTime = Date.now();
    } else {
      var dt = Date.now() - garderobPressTime;
      if (dt > LONG_PRESS) {
        dev["wb-mr6c_234"]["K6"] = true;
        if (garderobFanTimer) clearTimeout(garderobFanTimer);
        garderobFanTimer = setTimeout(function() {
          dev["wb-mr6c_234"]["K6"] = false;
          garderobFanTimer = null;
        }, 10 * 60 * 1000);
      } else {
        if (garderobFanTimer) {
          clearTimeout(garderobFanTimer);
          garderobFanTimer = null;
        }
        dev["wb-mr6c_234"]["K6"] = !dev["wb-mr6c_234"]["K6"];
      }
    }
  }
});

/*
 * 5. АВТОМАТИЧЕСКОЕ УПРАВЛЕНИЕ ВЫТЯЖКОЙ 
 * ПО РАБОТЕ СТИРАЛЬНОЙ МАШИНЫ С РАНДОМАЙЗЕРОМ
 */
var washerPower = "wb-map6s_224/P 1";
var fanRelay = "wb-mr6c_181/K5";

var FAN_PERIOD_MIN = 18000;
var FAN_PERIOD_MAX = 300000;
var FAN_ON_MIN = 20000;
var FAN_ON_MAX = 30000;

var fanScenarioActive = false;
var fanTimeout = null;
var fanScheduleTimeout = null;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scheduleFanPulse() {
  if (!fanScenarioActive) return;

  var pulseDuration = getRandomInt(FAN_ON_MIN, FAN_ON_MAX);
  dev[fanRelay] = true;
  fanTimeout = setTimeout(function() {
    dev[fanRelay] = false;
    var nextPeriod = getRandomInt(FAN_PERIOD_MIN, FAN_PERIOD_MAX);
    fanScheduleTimeout = setTimeout(scheduleFanPulse, nextPeriod);
  }, pulseDuration);
}

function startFanScenario() {
  if (fanScenarioActive) return;
  fanScenarioActive = true;
  scheduleFanPulse();
}

function stopFanScenario() {
  if (!fanScenarioActive) return;
  fanScenarioActive = false;

  if (fanTimeout) {
    clearTimeout(fanTimeout);
    fanTimeout = null;
  }
  if (fanScheduleTimeout) {
    clearTimeout(fanScheduleTimeout);
    fanScheduleTimeout = null;
  }
  dev[fanRelay] = false;
}

defineRule("washer_fan_control_random", {
  whenChanged: washerPower,
  then: function(newValue) {
    if (newValue > 30) {
      startFanScenario();
    } else {
      stopFanScenario();
    }
  }
});

// =============================================
// КОНЕЦ ФАЙЛА
// =============================================
