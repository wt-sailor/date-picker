"use client";

import { useState } from "react";
import { subDays, addDays } from "date-fns";
import DateRangePicker, { DateRange } from "../components/DateRangePicker";
import {
  Container,
  Typography,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
            Date Range Picker POC
          </Typography>

          <Box>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
              Select a single date:
            </Typography>
            <DateRangePicker
              initialRange={dateRange}
              onChange={(range) => setDateRange(range)}
              minDate={subDays(new Date(), 30)}
              maxDate={addDays(new Date(), 30)}
              single
            />
          </Box>

           <Box>
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
              Select a date range:
            </Typography>
            <DateRangePicker
              initialRange={dateRange}
              onChange={(range) => setDateRange(range)}
              // minDate={subDays(new Date(), 90)}
              // maxDate={addDays(new Date(), 90)}
            />
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Start Date:</strong>{" "}
              {dateRange.startDate || "Not selected"}
            </Typography>
            <Typography variant="body1">
              <strong>End Date:</strong> {dateRange.endDate || "Not selected"}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
