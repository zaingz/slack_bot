exports.timezones = [
  {key: "-12.0",value: "(GMT -12:00) Eniwetok, Kwajalein"},
  {key: "-11.0",value: "(GMT -11:00) Midway Island, Samoa"},
  {key: "-10.0",value: "(GMT -10:00) Hawaii"},
  {key: "-9.0",value: "(GMT -9:00) Alaska"},
  {key: "-8.0",value: "(GMT -8:00) Pacific Time (US &amp; Canada)"},
  {key: "-7.0",value: "(GMT -7:00) Mountain Time (US &amp; Canada)"},
  {key: "-6.0",value: "(GMT -6:00) Central Time (US &amp; Canada), Mexico City"},
  {key: "-5.0",value: "(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima"},
  {key: "-4.0",value: "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz"},
  {key: "-3.5",value: "(GMT -3:30) Newfoundland"},
  {key: "-3.0",value: "(GMT -3:00) Brazil, Buenos Aires, Georgetown"},
  {key: "-2.0",value: "(GMT -2:00) Mid-Atlantic"},
  {key: "-1.0",value: "(GMT -1:00 hour) Azores, Cape Verde Islands"},
  {key: "0.0",value: "(GMT) Western Europe Time, London, Lisbon, Casablanca"},
  {key: "1.0",value: "(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris"},
  {key: "2.0",value: "(GMT +2:00) Kaliningrad, South Africa"},
  {key: "3.0",value: "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"},
  {key: "3.5",value: "(GMT +3:30) Tehran"},
  {key: "4.0",value: "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"},
  {key: "4.5",value: "(GMT +4:30) Kabul"},
  {key: "5.0",value: "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"},
  {key: "5.5",value: "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"},
  {key: "5.75",value: "(GMT +5:45) Kathmandu"},
  {key: "6.0",value: "(GMT +6:00) Almaty, Dhaka, Colombo"},
  {key: "7.0",value: "(GMT +7:00) Bangkok, Hanoi, Jakarta"},
  {key: "8.0",value: "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"},
  {key: "9.0",value: "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"},
  {key: "9.5",value: "(GMT +9:30) Adelaide, Darwin"},
  {key: "10.0",value: "(GMT +10:00) Eastern Australia, Guam, Vladivostok"},
  {key: "11.0",value: "(GMT +11:00) Magadan, Solomon Islands, New Caledonia"},
  {key: "12.0",value: "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"},
]

exports.days = [
  {key: "1", value: "Monday", selected: true},
  {key: "2", value: "Tuesday", selected: true},
  {key: "3", value: "Wednesday", selected: true},
  {key: "4", value: "Thursday", selected: true},
  {key: "5", value: "Friday", selected: true},
  {key: "6", value: "Saturday", selected: false},
  {key: "0", value: "Sunday", selected: false}
]

exports.updatetime = [
  {key: "8:00 am",value: "8:00 am"},
  {key: "9:00 am",value: "9:00 am"},
  {key: "10:00 am",value: "10:00 am"},
  {key: "11:00 am",value: "11:00 am"},
  {key: "12:00 pm",value: "12:00 pm"},
  {key: "1:00 pm",value: "1:00 pm"},
  {key: "2:00 pm",value: "2:00 pm"},
  {key: "3:00 pm",value: "3:00 pm"},
  {key: "4:00 pm",value: "4:00 pm"},
  {key: "5:00 pm",value: "5:00 pm"},
]

function range(start, count) {
  return Array.apply(0, Array(count))
    .map(function (element, index) { 
      return index + start;  
    });
}
exports.max_hours = range(1,24);

exports.BASE_URL = "http://slackbot.comwosolutions.com";
//exports.BASE_URL = "http://localhost:8080";
exports.BASE_URL = "http://slackbot.comwosolutions.com";
exports.SLACK_CRED = {
  oauth_url: "https://slack.com/oauth/authorize",
  client_id: "35985964257.38182793409",
  secret: "841db71911786e093a8f44fd6d42584d",
  //scope: "identify,channels:write,channels:read,chat:write:bot,chat:write:user,users:read,team:read,users:write,bot"
  scope: "identify,bot"
}

