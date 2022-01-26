import { useState, useEffect, useMemo } from 'react';
import Chart from 'react-apexcharts';

const stonksUrl = `https://yahoo-finance-api.vercel.app/GME`;

async function fetchData() {
  const response = await fetch(stonksUrl);
  return response.json();
}

const directionEmojis = {
  up: '🚀',
  down: '💩',
  '': '',
};

const chartData = {
  options: {
    chart: {
      type: 'candlestick',
      height: 350,
    },
    title: {
      text: 'GameStop Chart',
      align: 'left',
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        /**
         * Allows users to apply a custom formatter function to yaxis labels.
         *
         * @param { String } value - The generated value of the y-axis tick
         * @param { index } index of the tick / currently executing iteration in yaxis labels array
         */
        formatter: function (val, index) {
          return '$' + val.toFixed(2);
        },
      },
    },
  },
};

const round = (number) => {
  return number ? number.toFixed(2) : null;
};

function App() {
  const [loading, isLoading] = useState(true);
  const [price, setPrice] = useState(-1);
  const [prevPrice, setPrevPrice] = useState(-1);
  const [time, setTime] = useState(null);

  const [series, setSeries] = useState([
    {
      data: [],
    },
  ]);

  useEffect(() => {
    let timeoutId;
    async function getLatestPrice() {
      try {
        const data = await fetchData();
        const gme = data.chart.result[0];
        setPrevPrice(price);
        setPrice(gme.meta.regularMarketPrice.toFixed(2));
        isLoading(false);
        const quote = gme.indicators.quote[0];
        const prices = gme.timestamp.map((timestamp, index) => ({
          x: new Date(timestamp * 1000),
          y: [
            quote.open[index],
            quote.high[index],
            quote.low[index],
            quote.close[index],
          ].map(round),
        }));
        setSeries([
          {
            data: prices,
          },
        ]);
      } catch (error) {
        console.log(error);
      }
      timeoutId = setTimeout(getLatestPrice, 5000);
    }
    getLatestPrice();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    function getTime() {
      const now = new Date();
      setTime(now);
    }
    setTimeout(getTime, 1000);
  }, [time]);

  const direction = useMemo(
    () => (prevPrice < price ? 'up' : prevPrice > price ? 'down' : ''),
    [prevPrice, price]
  );

  return (
    <div>
      <div className="ticker">GME</div>
      <div className={['price', direction].join(' ')}>
        ${loading ? 'Loading...' : `${price} ${directionEmojis[direction]}`}
      </div>
      <div>
        <div className="price-time">{time && time.toLocaleTimeString()}</div>
      </div>
      <div className="chart">
        <Chart
          options={chartData.options}
          series={series}
          type="candlestick"
          width="100%"
          height={350}
        />
      </div>
    </div>
  );
}

export default App;
