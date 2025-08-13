import React from 'react';
import styled from 'styled-components';

interface AuthLayoutProps {
  imageUrl?: string;
  imageTitle?: string;
  imageSubtitle?: string;
  children: React.ReactNode;
}

const SplitContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--color-background, #f6f6f6);
`;

const ImageSection = styled.div<{ imageUrl?: string }>`
  flex: 1.2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 40px 40px 48px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s ease-in-out infinite;
    z-index: 1;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.1);
  z-index: 2;
`;

const TaskIcons = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.1;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 12px;
  }

  &::before {
    top: 20%;
    right: 10%;
    animation: pulse 4s ease-in-out infinite;
  }

  &::after {
    bottom: 30%;
    left: 15%;
    animation: pulse 4s ease-in-out infinite 2s;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.1; }
    50% { transform: scale(1.1); opacity: 0.2; }
  }
`;



const ImageText = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255,255,255,0.95);
  margin: 0 0 32px 0;
  font-weight: 400;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
`;

const BrandLogo = styled.div`
  position: absolute;
  top: 40px;
  left: 48px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoSymbol = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 0;
    bottom: 0;
    border: 2px solid #fff;
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
  }
`;

const ConnectionLine = styled.div`
  position: absolute;
  top: 12px;
  left: 20px;
  width: 12px;
  height: 2px;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.6) 100%);
  border-radius: 1px;
  
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 0;
    width: 8px;
    height: 2px;
    background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.4) 100%);
    border-radius: 1px;
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: -2px;
`;

const LogoTitle = styled.span`
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const LogoSubtitle = styled.span`
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.9;
  margin-top: -2px;
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface, #fff);
`;

const AuthLayout: React.FC<AuthLayoutProps> = ({ imageUrl, imageTitle, imageSubtitle, children }) => (
  <SplitContainer>
    <ImageSection imageUrl={imageUrl}>
      <BrandLogo>
        <LogoIcon>
          <LogoSymbol />
          <ConnectionLine />
        </LogoIcon>
        <LogoText>
          <LogoTitle>TASK TANGO</LogoTitle>
          <LogoSubtitle>MANAGE SMARTER, NOT HARDER</LogoSubtitle>
        </LogoText>
      </BrandLogo>
      <TaskIcons />
      <Overlay />
      <ImageText>
        {imageTitle && <Title>{imageTitle}</Title>}
        {imageSubtitle && <Subtitle>{imageSubtitle}</Subtitle>}
      </ImageText>
    </ImageSection>
    <FormSection>
      {children}
    </FormSection>
  </SplitContainer>
);

export default AuthLayout;
