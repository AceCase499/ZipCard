declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import * as React from 'react';
  const content: React.FC<any> | string;
  export default content;
}
