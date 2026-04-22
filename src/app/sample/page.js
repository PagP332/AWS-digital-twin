"use client";
import FilterContainer from "@/components/FilterContainer";
import React, { useEffect, useState } from "react";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

export default function Sample() {
  const [fromFilterValue, setFromFilterValue] = useState(new Date());
  const [toFilterValue, setToFilterValue] = useState(new Date());

  useEffect(() => {
    console.log("From:", fromFilterValue);
  }, [fromFilterValue]);

  return (
    <div className="my-2.5 flex flex-row flex-wrap items-start px-2.5 py-2.5 [&>*>*]:m-2.5">
      <DateTimePicker
        // className={"text-base"}
        amPmAriaLabel="Select AM/PM"
        calendarAriaLabel="Toggle calendar"
        clearAriaLabel="Clear value"
        dayAriaLabel="Day"
        hourAriaLabel="Hour"
        maxDetail="second"
        minuteAriaLabel="Minute"
        monthAriaLabel="Month"
        nativeInputAriaLabel="Date and time"
        onChange={setFromFilterValue}
        secondAriaLabel="Second"
        value={fromFilterValue}
        yearAriaLabel="Year"
      />
    </div>
  );
}
