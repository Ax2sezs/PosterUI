import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PrivateRoute({ children, roleRequired }) {
  const [checked, setChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");

    const ok = !!token && (!roleRequired || role === roleRequired);
    setIsAuthed(ok);
    setChecked(true);
  }, [roleRequired]);

  if (!checked) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return children;
}
