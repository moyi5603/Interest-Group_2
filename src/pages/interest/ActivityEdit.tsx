import { Navigate, useParams } from "react-router-dom";

/** 兼容旧编辑路由，重定向至详情页编辑态 */
const ActivityEdit = () => {
  const { activityId } = useParams<{ activityId: string }>();
  return (
    <Navigate
      to={`/agents/interest-groups/activities/${activityId}?edit=1`}
      replace
    />
  );
};

export default ActivityEdit;
