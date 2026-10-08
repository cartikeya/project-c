import React, { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-google-identity-services="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentityServices = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error("Google Sign-In could not load. Check your connection and try again.")), { once: true });
  });
}

function GoogleSignIn({ clientId, onCredential, error }) {
  const buttonRef = useRef(null);
  const credentialHandler = useRef(onCredential);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    credentialHandler.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;
    let cancelled = false;

    loadGoogleIdentityServices()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          context: "signin",
          callback: (response) => {
            if (!response?.credential) {
              setLoadError("Google did not return a sign-in credential. Please try again.");
              return;
            }
            setLoading(true);
            Promise.resolve(credentialHandler.current(response.credential))
              .catch((reason) => setLoadError(reason.message || "Sign-in failed. Please try again."))
              .finally(() => setLoading(false));
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 320,
          logo_alignment: "left",
        });
      })
      .catch((reason) => setLoadError(reason.message));

    return () => {
      cancelled = true;
      if (window.google?.accounts?.id) window.google.accounts.id.cancel();
    };
  }, [clientId]);

  return (
    <section className="auth-screen">
      <div className="auth-card surface-panel">
        <a className="brand-lockup auth-brand" href="#top" aria-label="IPL Auction home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><span className="brand-kicker">THE LIVE ROOM</span><span className="brand-name">IPL <strong>AUCTION</strong></span></span>
        </a>
        <p className="eyebrow auth-eyebrow">YOUR SQUAD, SAVED</p>
        <h1>Sign in to<br /><span>keep your place.</span></h1>
        <p className="auth-copy">Your rooms, bids, and squad stay safely saved to your account, even when you close the tab.</p>
        {clientId ? (
          <>
            <div ref={buttonRef} className={`google-button-container${loading ? " is-loading" : ""}`} />
            {loading && <p className="auth-status">Signing you in securely…</p>}
          </>
        ) : (
          <div className="auth-config-notice" role="status">
            Google sign-in is not configured yet. Add <code>REACT_APP_GOOGLE_CLIENT_ID</code> to the frontend environment and rebuild.
          </div>
        )}
        {(loadError || error) && <p className="auth-error" role="alert">{loadError || error}</p>}
        <div className="auth-assurance"><span aria-hidden="true">✓</span> Google verifies your identity; your password is never shared with this app.</div>
      </div>
      <p className="auth-footnote">LIVE IPL AUCTION · PRIVATE ROOMS · ACCOUNT-BACKED SAVES</p>
    </section>
  );
}

export default GoogleSignIn;
