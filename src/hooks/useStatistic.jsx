import React, { useState, useEffect } from "react";
import { useDailyQuery } from "./useDailyQuery";

export default function useStatistic() {
  const { loading, data } = useDailyQuery();
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (loading || !data) return;

    setStatistics(/* data binding */);
  }, [loading, data]);

  return statistics;
}
