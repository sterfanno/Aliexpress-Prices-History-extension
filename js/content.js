// console.log(i18n("app_name") + ": init content.js");
console.log('connected content.js');

window.addEventListener('load', event => {
   Chart_App.init();

   App.get.prices()
      .then(json => App.prices_preparation_for_chart(json))
      .then(obj => Chart_App.gen(obj));
});


const App = {
   // request: url => fetch(url, {
   //    headers: new Headers({
   //       'Accept': 'application/json',
   //       'Content-Type': 'application/json',
   //    })
   // })
   //    .then(blob => blob.json())
   //    .then(data => console.log('get:', JSON.stringify(data)))
   //    .catch(error => console.error(error))
   // ,
   request: async url => {
      const response = await fetch(url, {
         headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
         })
      });
      const json = await response.json();
      console.log('fetch ok', json);
      return json;
   },

   page_id: location.href.split('/').pop().split('.')[0],

   cache: {
      set: save => {
         save && sessionStorage.setItem(App.page_id, JSON.stringify(save));
         return save;
      },

      get: () => {
         const STORAGE = sessionStorage.getItem(App.page_id);
         return STORAGE && JSON.parse(STORAGE);
      },
   },

   get: {
      // sellers: async () => App.cache.get() ||
      //    await App.request('https://api.aliradar.com/v2/sellers/ali/%s'.replace(/%s/, App.page_id))
      //       .then(res => App.cache.set(res)),

      prices: async () => App.cache.get() ||
         await App.request('https://api.aliradar.com/v2/items/ali/%s/prices'.replace(/%s/, App.page_id))
            .then(res => App.cache.set(res)),
   },

   prices_preparation_for_chart: jsonData => {
      if (!Object.keys(jsonData).length) return;

      let dates = [];
      let prices = [];

      // filtered
      jsonData.filter(key => {
         if (key.hasOwnProperty('date') && key.hasOwnProperty('min')) {
            if (prices[prices.length - 1] != key.min) { // unique price
               dates.push(key.date);
               prices.push(key.min);
               return true;
            }
         }
      });

      return {
         'label': dates,
         'poiners': prices,
         'curr': jsonData[0].curr,
      };
   },
}


const Chart_App = {
   init: () => {
      let chartDiv = document.createElement("div");
      chartDiv.className = "chart-container";
      // chartDiv.style = "position: relative; height:60vh; width:95vw";
      chartDiv.style = "position: relative; height:auto; width:100%";
      chartDiv.innerHTML = '<canvas id="chart">Your browser does not support the canvas element.</canvas>';

      chartDiv.addEventListener("click", () => window.open('https://www.pricearchive.org/aliexpress.com/item/' + App.page_id));
      document.querySelector(".product-info").appendChild(chartDiv);
   },

   gen: data => {
      if (!Object.keys(data).length) return;
      // unreliable string magic, or
      // fix moment: https://github.com/moment/moment/issues/1407
      moment.createFromInputFallback = config => config._d = new Date(config._i);;

      const ctx = document.getElementById('chart').getContext('2d');
      const chart = new Chart(ctx, {
         type: 'line',
         data: {
            labels: data.label.map(d => new Date(d).toString()),
            datasets: [{
               label: 'Prices',
               data: data.poiners,
               fill: false,
               borderColor: 'rgba(255, 99, 132, 1)',
               borderWidth: 3,
               lineTension: 0
            }]
         },
         // data.curr
         options: {
            // animation: { duration: 0 },
            hover: { animationDuration: 0 },
            // responsiveAnimationDuration: 0,
            title: { text: 'Prices history' },
            scales: {
               xAxes: [{
                  type: 'time',
                  time: {
                     // round: 'day'
                     tooltipFormat: 'll'
                  },
                  scaleLabel: {
                     labelString: 'Date'
                  }
               }],
               yAxes: [{
                  scaleLabel: {
                     display: true,
                     labelString: 'value'
                  }
               }]
            },
         }
      });
   }
}
