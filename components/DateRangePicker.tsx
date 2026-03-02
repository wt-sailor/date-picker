import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Popover,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  isWithinInterval,
  setMonth as dfSetMonth,
  setYear as dfSetYear,
} from "date-fns";

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangePickerProps {
  onChange?: (range: DateRange) => void;
  initialRange?: DateRange;
  minDate?: Date;
  maxDate?: Date;
  single?: boolean;
}

function CalendarMonth({
  month,
  startDate,
  endDate,
  hoverDate,
  onDateClick,
  onDateHover,
  onPrev,
  onNext,
  showPrev,
  showNext,
  onChangeMonth,
  minDate,
  maxDate,
}: {
  month: Date;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
  onPrev?: () => void;
  onNext?: () => void;
  showPrev: boolean;
  showNext: boolean;
  onChangeMonth: (d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    const rows: Date[][] = [];
    let current = start;
    while (isBefore(current, end) || isSameDay(current, end)) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(current);
        current = addDays(current, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [month]);

  const effectiveEnd = endDate || hoverDate;

  const isInRange = (day: Date) => {
    if (!startDate || !effectiveEnd) return false;
    const rangeStart = isBefore(startDate, effectiveEnd)
      ? startDate
      : effectiveEnd;
    const rangeEnd = isAfter(startDate, effectiveEnd)
      ? startDate
      : effectiveEnd;
    return isWithinInterval(day, { start: rangeStart, end: rangeEnd });
  };

  const isStart = (day: Date) => startDate && isSameDay(day, startDate);
  const isEnd = (day: Date) => effectiveEnd && isSameDay(day, effectiveEnd);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Month Header */}
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 0.5,
          }}
        >
          <Select
            value={month.getMonth()}
            onChange={(e) => {
              const newDate = dfSetMonth(month, e.target.value as number);
              onChangeMonth(newDate);
            }}
            variant="standard"
            disableUnderline
            IconComponent={() => null} // Hide default dropdown icon for month
            sx={{ fontWeight: 600, fontSize: 20, color: "#2B364A" }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <MenuItem key={i} value={i} sx={{ fontSize: 14 }}>
                {format(new Date(2000, i, 1), "MMMM")}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ display: "flex", gap: 1 }}>
            {showPrev ? (
              <IconButton
                size="small"
                onClick={onPrev}
                sx={{ color: "#004B87", p: 0.5 }}
              >
                <svg
                  width="6"
                  height="10"
                  viewBox="0 0 6 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 9L1 5L5 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            ) : (
              <Box sx={{ width: 24 }} />
            )}
            {showNext ? (
              <IconButton
                size="small"
                onClick={onNext}
                sx={{ color: "#004B87", p: 0.5 }}
              >
                <svg
                  width="6"
                  height="10"
                  viewBox="0 0 6 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 9L5 5L1 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            ) : (
              <Box sx={{ width: 24 }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Day headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          mb: 1,
          px: 0.5,
        }}
      >
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <Typography
            key={d}
            sx={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#9CA3AF",
              py: 0.5,
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Dates */}
      <Box sx={{ px: 0.5 }}>
        {weeks.map((week, wi) => (
          <Box
            key={wi}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
              mb: 0.5,
            }}
          >
            {week.map((day, di) => {
              const inMonth = isSameMonth(day, month);
              const selected = isStart(day) || isEnd(day);
              const inRange = isInRange(day) && !selected;
              const isToday = isSameDay(day, new Date());

              const disabled = (() => {
                if (
                  minDate &&
                  isBefore(day, minDate) &&
                  !isSameDay(day, minDate)
                )
                  return true;
                if (
                  maxDate &&
                  isAfter(day, maxDate) &&
                  !isSameDay(day, maxDate)
                )
                  return true;
                return false;
              })();

              return (
                <Box
                  key={di}
                  onClick={() => inMonth && !disabled && onDateClick(day)}
                  onMouseEnter={() => inMonth && !disabled && onDateHover(day)}
                  onMouseLeave={() => onDateHover(null)}
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 36,
                    width: "100%",
                    borderRadius: 2,
                    cursor: inMonth && !disabled ? "pointer" : "default",
                    bgcolor: inRange ? "#E1F0FF" : "transparent",
                    color: !inMonth
                      ? "#D1D5DB"
                      : disabled
                        ? "#9CA3AF"
                        : "#004B87",
                    ...(selected && {
                      bgcolor: "#85C6FF",
                      color: "#004B87",
                    }),
                    ...(isToday &&
                      !selected &&
                      !inRange && {
                        bgcolor: "transparent",
                      }),
                    ...(isToday &&
                      !selected && {
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          border: "1px solid",
                          borderColor: "#004B87",
                          borderRadius: 2,
                        },
                      }),
                    ...(isStart(day) &&
                      effectiveEnd && {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      }),
                    ...(isEnd(day) &&
                      startDate && {
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                      }),
                    "&:hover":
                      inMonth && !selected && !disabled
                        ? { bgcolor: "#F3F4F6" }
                        : {},
                  }}
                >
                  <Typography
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "inherit",
                      lineHeight: 1,
                    }}
                  >
                    {format(day, "d")}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function DateRangePicker({
  onChange,
  initialRange,
  minDate,
  maxDate,
  single,
}: DateRangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(
    initialRange?.startDate ? new Date(initialRange.startDate) : null,
  );
  const [leftMonth, setLeftMonth] = useState<Date>(
    startDate ? startDate : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialRange?.endDate ? new Date(initialRange.endDate) : null,
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [view, setView] = useState<"calendar" | "year">("calendar");
  const [tempYear, setTempYear] = useState<number>(new Date().getFullYear());
  const yearListRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (view === "year") {
      setTimeout(() => {
        setTempYear(leftMonth.getFullYear());
        const selectedEl = yearListRef.current?.querySelector(
          '[data-selected="true"]',
        );
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: "center", behavior: "instant" });
        }
      }, 0);
    }
  }, [view, leftMonth]);

  useEffect(() => {
    // Sync calendar month with start date when popup is opened.
    if (anchorEl) {
      if (startDate) {
        setLeftMonth(startDate);
      } else {
        setLeftMonth(new Date());
      }
    }
  }, [anchorEl, startDate]);

  const handleDateClick = useCallback(
    (day: Date) => {
      if (single) {
        setStartDate(day);
        setEndDate(day);
        setSelectingEnd(false);
        const result: DateRange = {
          startDate: format(day, "yyyy-MM-dd"),
          endDate: format(day, "yyyy-MM-dd"),
        };
        onChange?.(result);
        return;
      }

      if (!selectingEnd) {
        setStartDate(day);
        setEndDate(null);
        setSelectingEnd(true);
      } else {
        let s = startDate!;
        let e = day;
        if (isBefore(e, s)) {
          [s, e] = [e, s];
        }
        setStartDate(s);
        setEndDate(e);
        setSelectingEnd(false);
        const result: DateRange = {
          startDate: format(s, "yyyy-MM-dd"),
          endDate: format(e, "yyyy-MM-dd"),
        };
        onChange?.(result);
      }
    },
    [selectingEnd, startDate, onChange, single],
  );

  const displayValue =
    single && startDate
      ? format(startDate, "MMM dd, yyyy")
      : startDate && endDate
        ? `${format(startDate, "MMM dd, yyyy")} – ${format(endDate, "MMM dd, yyyy")}`
        : startDate
          ? `${format(startDate, "MMM dd, yyyy")} – ...`
          : "Select date range";

  return (
    <>
      <TextField
        size="small"
        value={displayValue}
        onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 2V6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </InputAdornment>
          ),
          sx: { cursor: "pointer", minWidth: 300 },
        }}
      />
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
          setView("calendar");
          if (selectingEnd) {
            setSelectingEnd(false);
            setStartDate(null);
            setEndDate(null);
          }
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: 2 } } }}
      >
        <Paper sx={{ p: 2 }} elevation={0}>
          <Box sx={{ width: 320, px: 1 }}>
            {/* Title */}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 18,
                color: "#2B364A",
                mb: 2,
                pt: 1,
                px: 1,
              }}
            >
              {single ? "Select single date" : "Select date range"}
            </Typography>

            {/* Year Selector Button */}
            <Box sx={{ px: 1, mb: 2 }}>
              <Box
                onClick={() => setView(view === "year" ? "calendar" : "year")}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  color: "#4A5568",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {view === "year" ? tempYear : leftMonth.getFullYear()}
                <Box
                  sx={{
                    bgcolor: view === "year" ? "#85C6FF" : "transparent",
                    color: view === "year" ? "#004B87" : "#004B87",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    transition: "all 0.2s",
                  }}
                >
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: view === "year" ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
              </Box>
            </Box>

            {view === "calendar" ? (
              <CalendarMonth
                month={leftMonth}
                startDate={startDate}
                endDate={endDate}
                hoverDate={selectingEnd ? hoverDate : null}
                onDateClick={handleDateClick}
                onDateHover={setHoverDate}
                onPrev={() => setLeftMonth((m) => subMonths(m, 1))}
                onNext={() => setLeftMonth((m) => addMonths(m, 1))}
                showPrev
                showNext
                onChangeMonth={setLeftMonth}
                minDate={minDate}
                maxDate={maxDate}
              />
            ) : (
              <Box
                ref={yearListRef}
                sx={{
                  height: 280,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  pb: 2,
                }}
              >
                {Array.from({ length: 150 }).map((_, i) => {
                  const y = new Date().getFullYear() - 75 + i;
                  const isSelected = y === tempYear;
                  return (
                    <Box
                      key={y}
                      data-selected={isSelected}
                      onClick={() => setTempYear(y)}
                      sx={{
                        cursor: "pointer",
                        px: 3,
                        py: 1,
                        fontSize: 16,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? "#004B87" : "#4A5568",
                        border: isSelected
                          ? "1px solid #004B87"
                          : "1px solid transparent",
                        borderRadius: 2,
                        width: "80%",
                        textAlign: "center",
                        "&:hover": {
                          bgcolor: "#F3F4F6",
                        },
                      }}
                    >
                      {y}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            px: 3,
            pb: 3,
            gap: 2,
          }}
        >
          {view === "calendar" ? (
            <>
              <Button
                onClick={() => {
                  setAnchorEl(null);
                  setView("calendar");
                }}
                sx={{
                  color: "#004B87",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: 15,
                  "&:hover": { bgcolor: "transparent", color: "#003A69" },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setAnchorEl(null);
                  setView("calendar");
                }}
                sx={{
                  bgcolor: "#F95E05",
                  color: "white",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: 15,
                  px: 3,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#D95204",
                    boxShadow: "none",
                  },
                }}
              >
                Apply
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setView("calendar")}
                sx={{
                  color: "#004B87",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: 15,
                  "&:hover": { bgcolor: "transparent", color: "#003A69" },
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setLeftMonth(dfSetYear(leftMonth, tempYear));
                  setView("calendar");
                }}
                sx={{
                  bgcolor: "#F95E05",
                  color: "white",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: 15,
                  px: 3,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#D95204",
                    boxShadow: "none",
                  },
                }}
              >
                Select Year
              </Button>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
}
