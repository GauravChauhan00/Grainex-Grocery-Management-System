export default function LoadingState({ rows = 5 }) {
  return (
    <div className="loading-state" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <span /><span /><span /><span />
        </div>
      ))}
    </div>
  );
}
