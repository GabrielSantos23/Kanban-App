import React from 'react';
import styled, { keyframes } from 'styled-components';

const LoadingContainer = styled.div`
  text-align: center;
`;

const LoadingDots = styled.span`
  display: inline-block;
  animation: ${keyframes`
    0% { opacity: 0.2; }
    20% { opacity: 1; }
    100% { opacity: 0.2; }
  `} 1s linear infinite;
`;

const LoadingText = () => {
  return (
    <LoadingContainer>
      loading
      <LoadingDots>...</LoadingDots>
    </LoadingContainer>
  );
};

export default LoadingText;
