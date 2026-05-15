export function DashboardSkeleton() {
  return (
    <section className="page skeleton-page">
      <div className="skeleton-title">
        <span className="skeleton sk-sm"></span>
        <span className="skeleton sk-title"></span>
      </div>
      <div className="stats">
        {[1, 2, 3, 4].map((n) => <div className="skeleton sk-card" key={n}></div>)}
      </div>
      <div className="dashboard-grid">
        <div className="skeleton sk-panel"></div>
        <div className="skeleton sk-panel"></div>
      </div>
    </section>
  );
}
