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
  background: #222 url(${props => props.imageUrl || ''}) center/cover no-repeat;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px 40px 40px 48px;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
`;

const ImageText = styled.div`
  position: relative;
  z-index: 2;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #fff;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #fff;
  margin: 0;
  font-weight: 400;
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
