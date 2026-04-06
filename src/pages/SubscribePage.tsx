import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReadyLoopClient } from '@readyloop/sdk';

import { APP_NAME } from '@/config';

interface AuthState {
  aurigaUid: string | null;
  userEmail: string | null;
}

interface SubscribePageProps {
  client: ReadyLoopClient;
  auth: AuthState;
}

export function SubscribePage({ client, auth }: SubscribePageProps) {
  const navigate = useNavigate();
  const [stripeConfig, setStripeConfig] = useState<{
    publishableKey: string;
    pricingTableId: string;
  } | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isCheckoutReturn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('checkout') === 'success';
  });

  // Fetch Stripe config
  useEffect(() => {
    if (isCheckoutReturn) return;
    client
      .fetchConfig()
      .then((cfg) => {
        if (cfg.stripe_publishable_key && cfg.stripe_pricing_table_id) {
          setStripeConfig({
            publishableKey: cfg.stripe_publishable_key,
            pricingTableId: cfg.stripe_pricing_table_id,
          });
        }
      })
      .catch(() => {});
  }, [client, isCheckoutReturn]);

  // Load Stripe pricing table script
  useEffect(() => {
    if (isCheckoutReturn || !stripeConfig) return;
    const src = 'https://js.stripe.com/v3/pricing-table.js';
    if (document.querySelector(`script[src="${src}"]`)) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, [isCheckoutReturn, stripeConfig]);

  // Poll billing after checkout
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!isCheckoutReturn) return;
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const billing = await client.getBilling();
        if (billing.has_subscription) {
          if (pollRef.current) clearInterval(pollRef.current);
          navigate('/', { replace: true });
        }
      } catch {
        // retry
      }
      if (attempts >= 10) {
        if (pollRef.current) clearInterval(pollRef.current);
        navigate('/', { replace: true });
      }
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [client, isCheckoutReturn, navigate]);

  if (isCheckoutReturn) {
    return (
      <div className="sbaa-subscribe">
        <div style={{ color: 'var(--rl-fg-muted)' }}>Setting up your account...</div>
      </div>
    );
  }

  const handleFreePlan = async () => {
    try {
      await client.confirmFreePlan();
    } catch {
      // continue anyway
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="sbaa-subscribe">
      <h1 className="sbaa-subscribe__title">{APP_NAME}</h1>
      <h2 className="sbaa-subscribe__subtitle">Choose a plan</h2>

      <div className="sbaa-subscribe__plans">
        <div className="sbaa-subscribe__card">
          <div className="sbaa-subscribe__plan-name">Free</div>
          <div className="sbaa-subscribe__plan-desc">250 skill credits per month</div>
          <div className="sbaa-subscribe__price">
            <span className="sbaa-subscribe__price-amount">$0</span>
            <span className="sbaa-subscribe__price-interval">per month</span>
          </div>
          <button className="sbaa-subscribe__cta" onClick={handleFreePlan}>
            Get started free
          </button>
        </div>

        {stripeConfig && scriptLoaded && (
          // @ts-expect-error -- Stripe pricing table is a web component
          <stripe-pricing-table
            pricing-table-id={stripeConfig.pricingTableId}
            publishable-key={stripeConfig.publishableKey}
            client-reference-id={auth.aurigaUid ?? undefined}
            customer-email={auth.userEmail ?? undefined}
            style={{ flex: 1, minWidth: 0 }}
          />
        )}
      </div>
    </div>
  );
}
