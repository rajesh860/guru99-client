import { Link } from "react-router-dom";
import "./DashboardCard.scss";

interface DashboardCardProps {
  image: string;
  title: string;
  link?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  image,
  title,
  link,
  onClick,
}) => {
  const content = (
    <>
      <div className="dashboard-card__image">
        <img src={image} alt={title} height={100} />
      </div>
      <div className="dashboard-card__title">
        <span className="tital_name_dash">{title}</span>
      </div>
    </>
  );

  if (link) {
    return (
      <Link to={link} className="dashboard-card">
        {content}
      </Link>
    );
  }

  return (
    <div className="dashboard-card" onClick={onClick}>
      {content}
    </div>
  );
};

export default DashboardCard;
