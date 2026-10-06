import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  badge?: string;
  icon: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  badge,
  icon,
}) => {
  return (
    <div className="glass-card feature-card">
      <div className="feature-header">
        <span className="feature-icon" role="img" aria-hidden="true">{icon}</span>
        {badge && <span className="badge badge-moderate">{badge}</span>}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
};
