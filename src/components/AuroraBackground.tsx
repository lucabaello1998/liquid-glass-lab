/** Animated aurora backdrop so the glass has something juicy to refract. */
export function AuroraBackground() {
  return (
    <>
      <div className="aurora" aria-hidden>
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
        <span className="blob blob-4" />
      </div>
      <div className="noise" aria-hidden />
    </>
  );
}
