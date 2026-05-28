import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const Turnstile = forwardRef(function Turnstile({ onToken }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current != null) {
      window.turnstile.remove(widgetIdRef.current);
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      execution: 'render',
      appearance: 'always',
      'refresh-expired': 'manual',
      callback: (token) => onToken(token),
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
      theme: 'auto',
    });
  }, [onToken]);

  useImperativeHandle(ref, () => ({
    reset() {
      onToken('');
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }), [onToken]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;
      window.onTurnstileLoad = renderWidget;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  if (!TURNSTILE_SITE_KEY) return null;

  return <div ref={containerRef} className="mt-2" />;
});

export default Turnstile;
