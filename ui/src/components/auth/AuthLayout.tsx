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
  width: 60px;
  height: 48px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FlowingShape = styled.div`
  position: relative;
  width: 54px;
  height: 42px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 8px;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.95) 0%, 
      rgba(255,255,255,0.8) 50%,
      rgba(255,255,255,0.6) 100%);
    border-radius: 50% 40% 60% 30%;
    transform: rotate(-15deg);
    animation: morph 8s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 0;
    width: 28px;
    height: 28px;
    background: linear-gradient(225deg, 
      rgba(255,255,255,0.7) 0%, 
      rgba(255,255,255,0.4) 100%);
    border-radius: 40% 60% 50% 30%;
    transform: rotate(25deg);
    animation: morph 8s ease-in-out infinite reverse;
  }
  
  @keyframes morph {
    0%, 100% { 
      border-radius: 50% 40% 60% 30%;
      transform: rotate(-15deg) scale(1);
    }
    25% { 
      border-radius: 40% 60% 30% 50%;
      transform: rotate(-10deg) scale(1.05);
    }
    50% { 
      border-radius: 60% 30% 50% 40%;
      transform: rotate(-20deg) scale(0.95);
    }
    75% { 
      border-radius: 30% 50% 40% 60%;
      transform: rotate(-12deg) scale(1.02);
    }
  }
`;

const StarAccent = styled.div`
  position: absolute;
  top: -2px;
  right: 2px;
  color: rgba(255,255,255,0.9);
  font-size: 14px;
  animation: twinkle 4s ease-in-out infinite;
  
  &::before {
    content: '✦';
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.7; transform: scale(1) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.1) rotate(180deg); }
  }
`;

const SecondaryAccent = styled.div`
  position: absolute;
  bottom: 2px;
  left: -2px;
  color: rgba(255,255,255,0.6);
  font-size: 10px;
  animation: twinkle 4s ease-in-out infinite 2s;
  
  &::before {
    content: '✧';
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LogoTitle = styled.span`
  font-size: 32px;
  font-weight: 300;
  letter-spacing: -1px;
  line-height: 1;
  color: rgba(255,255,255,0.95);
  font-family: 'Georgia', 'Times New Roman', serif;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
  font-style: italic;
`;

const LogoSubtitle = styled.span`
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 3px;
  text-transform: lowercase;
  color: rgba(255,255,255,0.75);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  margin-top: 2px;
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
          <FlowingShape />
          <StarAccent />
          <SecondaryAccent />
        </LogoIcon>
        <LogoText>
          <LogoTitle>Task Tango</LogoTitle>
          <LogoSubtitle>manage smarter, not harder</LogoSubtitle>
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
