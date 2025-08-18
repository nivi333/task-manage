declare module '@ant-design/plots' {
  import React from 'react';
  export interface PlotProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
    data?: T[];
    [key: string]: any;
  }
  export const Pie: React.FC<PlotProps>;
  export const Column: React.FC<PlotProps>;
  export const Bar: React.FC<PlotProps>;
  export const Line: React.FC<PlotProps>;
  export default {}; // allow default import patterns if used
}
