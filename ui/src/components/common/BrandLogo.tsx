import React from 'react';
import styled, { keyframes } from 'styled-components';

interface BrandLogoProps {
  compact?: boolean; // emblem-only for tight spaces
  variant?: 'light' | 'dark'; // adapt colors for header (light) vs sider (dark)
  showSubtitle?: boolean; // control showing the slogan
  textColor?: string; // override title text color
}

const Wrapper = styled.div<{ compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => (p.compact ? '0' : '10px')};
`;

const LogoIcon = styled.div<{ compact?: boolean }>`
  width: ${(p) => (p.compact ? '36px' : '48px')};
  height: ${(p) => (p.compact ? '28px' : '36px')};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
`;

const morph = keyframes`
  0%, 100% { transform: rotate(-15deg) scale(1); }
  25% { transform: rotate(-10deg) scale(1.03); }
  50% { transform: rotate(-20deg) scale(0.97); }
  75% { transform: rotate(-12deg) scale(1.01); }
`;

const FlowingShape = styled.div<{ variant: 'light' | 'dark' }>`
  position: relative;
  width: 100%;
  height: 100%;
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 6px;
    width: 70%;
    height: 70%;
    background: ${(p) =>
      p.variant === 'dark'
        ? 'linear-gradient(135deg, rgba(64,150,255,0.95) 0%, rgba(64,150,255,0.7) 100%)'
        : 'linear-gradient(135deg, rgba(22,119,255,0.95) 0%, rgba(22,119,255,0.7) 100%)'};
    border-radius: 50% 40% 60% 30%;
    transform: rotate(-15deg);
    animation: ${morph} 8s ease-in-out infinite;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: -2px;
    width: 55%;
    height: 55%;
    background: ${(p) =>
      p.variant === 'dark'
        ? 'linear-gradient(225deg, rgba(64,150,255,0.55) 0%, rgba(64,150,255,0.35) 100%)'
        : 'linear-gradient(225deg, rgba(22,119,255,0.55) 0%, rgba(22,119,255,0.35) 100%)'};
    border-radius: 40% 60% 50% 30%;
    transform: rotate(25deg);
    animation: ${morph} 8s ease-in-out infinite reverse;
  }
`;

const StarAccent = styled.div<{ variant: 'light' | 'dark' }>`
  position: absolute;
  top: -2px;
  right: 2px;
  color: ${(p) => (p.variant === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)')};
  font-size: 12px;
  &::before { content: "\\2726"; }
`;

const SecondaryAccent = styled.div<{ variant: 'light' | 'dark' }>`
  position: absolute;
  bottom: 0;
  left: -2px;
  color: ${(p) => (p.variant === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)')};
  font-size: 9px;
  &::before { content: "\\2727"; }
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Title = styled.span<{ color?: string }>`
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: ${(p) => p.color || 'inherit'};
`;

const Subtitle = styled.span<{ color?: string }>`
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: lowercase;
  opacity: 0.6;
  color: ${(p) => p.color || 'inherit'};
`;

const BrandLogo: React.FC<BrandLogoProps> = ({ compact, variant = 'light', showSubtitle = true, textColor }) => (
  <Wrapper compact={compact}>
    <LogoIcon compact={compact}>
      <FlowingShape variant={variant} />
      <StarAccent variant={variant} />
      <SecondaryAccent variant={variant} />
    </LogoIcon>
    {!compact && (
      <TextBlock>
        <Title color={textColor}>Task Tango</Title>
        {showSubtitle && (
          <Subtitle color={textColor}>manage smarter, not harder</Subtitle>
        )}
      </TextBlock>
    )}
  </Wrapper>
);

export default BrandLogo;
