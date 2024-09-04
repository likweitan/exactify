import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LoanLineChart = ({ data, selectedCurrency }) => {
  const formatCurrency = (value) => {
    return `${selectedCurrency.symbol}${parseFloat(value).toFixed(2)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 40,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year"
        interval={5} />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="principal" stroke="#8884d8" dot={false} />
        <Line type="monotone" dataKey="interest" stroke="#82ca9d" dot={false} />
        <Line type="monotone" dataKey="balance" stroke="#ffc658" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LoanLineChart;