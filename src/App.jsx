import { Delete } from "@mui/icons-material"
import { AppBar, Box, Button, IconButton, List, ListItem, ListItemText, Modal, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Toolbar, Typography } from "@mui/material"
import { businessDaysBetween as getNumberOfbusinessDaysBetween } from "./date/businness-days-between"
import { useFormik } from "formik"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useIndexedDB } from "react-indexed-db-hook"
import { NumberInput } from "./components/NumberInput"

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4
}

function App() {
  const {getAll: getAllEvents, add: addEvent, deleteRecord: deleteEvent} = useIndexedDB("events")
  const {getAll: getAllDays, add: addDay, deleteRecord: deleteDay} = useIndexedDB("days")
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [minimumBusinessDays, setMinimumBusinessDays] = useState(0)
  /** @type {(_e: unknown, val: number) => void} */
  const handleMinimumBusinessDaysChange = useCallback((_e, val) => {
    setMinimumBusinessDays(val)
  }, [setMinimumBusinessDays])
  const [events, setEvents] = useState([])
  const [days, setDays] = useState([])
  const result = useMemo(() => {
    return events.map((event) => ({
      name: event.name,
      date: event.date,
      businessDays: getNumberOfbusinessDaysBetween(new Date(), new Date(event.date), days.map((day) => new Date(day.date)))
    }))
  }, [events, days])
  const retrieveEvents = useCallback(() => {
    getAllEvents().then(setEvents)
  }, [getAllEvents])
  const retrieveDays = useCallback(() => {
    getAllDays().then(setDays)
  }, [getAllDays])
  useEffect(() => {
    retrieveEvents()
    retrieveDays()
  }, [retrieveEvents, retrieveDays])
  const eventFormik = useFormik({
    initialValues: {
      name: "",
      date: new Date().toISOString().split("T")[0]
    },
    onSubmit: (values) => {
      addEvent(values)
        .then(() => {
          retrieveEvents()
          closeEventModal()
        })
    }
  })
  const handleOpenAddEventModal = useCallback(() => {
    eventFormik.resetForm()
    setShowEventModal(true)
  }, [eventFormik, setShowEventModal])
  /** @type {(id: string) => void} */
  const handleDeleteEvent = useCallback((id) => {
    deleteEvent(id)
      .then(() => {
        retrieveEvents()
      })
  }, [deleteEvent, retrieveEvents])
  const closeEventModal = useCallback(() => {
    setShowEventModal(false)
  }, [setShowEventModal])
  const dayFormik = useFormik({
    initialValues: {
      date: new Date().toISOString().split("T")[0],
      name: ""
    },
    onSubmit: (values) => {
      addDay(values)
        .then(() => {
          retrieveDays()
          closeDayModal()
        })
    }
  })
  const handleOpenDayEventModal = useCallback(() => {
    dayFormik.resetForm()
    setShowDayModal(true)
  }, [dayFormik, setShowDayModal])
  /** @type {(id: string) => void} */
  const handleDeleteDay = useCallback((id) => {
    deleteDay(id)
      .then(() => {
        retrieveDays()
      })
  }, [deleteDay, retrieveDays])
  const closeDayModal = useCallback(() => {
    setShowDayModal(false)
  }, [setShowDayModal])
  return (
    <Box height="100%">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Business Days Calculator
          </Typography>
        </Toolbar>
      </AppBar>
      <Box height="100%" padding={5} sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gridTemplateRows: "50% 50%", gridTemplateAreas: "\"events result\" \"days result\"", gap: 2 }}>
        <Box sx={{ gridArea: "events", display: "flex", flexDirection: "column", gap: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h5">Due Dates</Typography>
            <Button variant="contained" onClick={handleOpenAddEventModal}>Add Date</Button>
          </Stack>
          <Box overflow="auto" sx={{ flex: 1, overflow: "auto" }}>
            <List>
              {
                events.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemText primary={event.name} secondary={event.date} />
                    <IconButton onClick={() => handleDeleteEvent(event.id)}>
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))
              }
            </List>
          </Box>
        </Box>
        <Box sx={{ gridArea: "days", display: "flex", flexDirection: "column", gap: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h5">Non-Working Days</Typography>
            <Button variant="contained" onClick={handleOpenDayEventModal}>Add Day</Button>
          </Stack>
          <List>
            {
              days.map((day) => (
                <ListItem key={day.id}>
                  <ListItemText primary={day.date} secondary={day.name} />
                  <IconButton onClick={() => handleDeleteDay(day.id)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))
            }
          </List>
          </Box>
        <Box sx={{ gridArea: "result" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Results</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Minimum Business Days: </Typography>
            <NumberInput value={minimumBusinessDays} onChange={handleMinimumBusinessDaysChange} min={0} max={100}/>
          </Stack>
          </Stack>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Business Days</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                result.map((event, i) => (
                  <TableRow key={`event-${i}`} sx={(theme) => ({ backgroundColor: event.businessDays <= minimumBusinessDays ? theme.palette.error.light : undefined })}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.businessDays}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </Box>
      </Box>
      <Modal open={showEventModal} onClose={closeEventModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">Add Event</Typography>
            <form onSubmit={eventFormik.handleSubmit}>
              <Stack spacing={2}>
                <TextField label="Event Name" name="name" required value={eventFormik.values.name} onChange={eventFormik.handleChange}/>
                <TextField label="Due Date" type="date" name="date" required value={eventFormik.values.date} onChange={eventFormik.handleChange}/>
                <Button variant="contained" type="submit">Add</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
      <Modal open={showDayModal} onClose={closeDayModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">Add Day</Typography>
            <form onSubmit={dayFormik.handleSubmit}>
              <Stack spacing={2}>
                <TextField label="Date" type="date" name="date" required value={dayFormik.values.date} onChange={dayFormik.handleChange}/>
                <TextField label="Name" name="name" required value={dayFormik.values.name} onChange={dayFormik.handleChange}/>
                <Button variant="contained" type="submit">Add</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}

export default App
