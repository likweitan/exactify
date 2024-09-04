import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F'];

const LoanPieChart = ({ principal, interest, selectedCurrency }) => {
    const formatCurrency = (value) => {
      return `${selectedCurrency.symbol}${parseFloat(value).toFixed(2)}`;
    };

  const data = [
    { name: 'Principal', value: principal },
    { name: 'Interest', value: interest },
  ];


  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          dataKey="value"
          innerRadius={50} outerRadius={70} fill="#82ca9d" label 
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LoanPieChart;