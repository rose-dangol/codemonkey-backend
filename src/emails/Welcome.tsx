import React from 'react';
import { Button, Html, Head, Body } from 'react-email';

export default function Welcome() {
  return (
    <Html>
      <Head />
      <Body>
        <Button
          href="https://example.com"
          style={{ background: '#000', color: '#fff', padding: '12px 20px' }}
        >
          Click me
        </Button>
      </Body>
    </Html>
  );
}
