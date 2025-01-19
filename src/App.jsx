import { Close, Delete, Edit, GitHub, Help, ImportContacts, ImportExport } from "@mui/icons-material"
import { AppBar, Box, Button, IconButton, InputLabel, List, ListItem, ListItemText, Modal, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useNotifications } from "@toolpad/core"
import { useFormik } from "formik"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useIndexedDB } from "react-indexed-db-hook"
import { z } from "zod"
import { NumberInput } from "./components/NumberInput"
import { businessDaysBetween as getNumberOfbusinessDaysBetween } from "./date/businness-days-between"

const todayDate = new Date().toISOString().split("T")[0]

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

const DataSchema = z.object({
  events: z.array(z.object({
    id: z.number().int().positive(),
    name: z.string(),
    date: z.string().date()
  })),
  days: z.array(z.object({
    id: z.number().int().positive(),
    name: z.string(),
    date: z.string().date()
  }))
})

/**
 * Event
 * @typedef {object} Event
 * @property {string} id The event id
 * @property {string} name The event name
 * @property {string} date The event date
 */

/**
 * Date
 * @typedef {object} Day
 * @property {string} id The date id
 * @property {string} name The date name
 * @property {string} date The date date
 */

function App() {
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up("md"))
  const notifications = useNotifications()
  const {t} = useTranslation()
  const {getAll: getAllEvents, add: addEvent, update: updateEvent, deleteRecord: deleteEvent} = useIndexedDB("events")
  const {getAll: getAllDays, add: addDay, update: updateDay, deleteRecord: deleteDay} = useIndexedDB("days")
  const [search, setSearch] = useState("")
  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value)
  }, [setSearch])
  const handleResetSearch = useCallback(() => {
    setSearch("")
  }, [setSearch])
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showUpdateEventModal, setShowUpdateEventModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [showUpdateDayModal, setShowUpdateDayModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [minimumBusinessDays, setMinimumBusinessDays] = useState(0)
  const handleOpenHelpModal = useCallback(() => {
    setShowHelpModal(true)
  }, [setShowHelpModal])
  const closeHelpModal = useCallback(() => {
    setShowHelpModal(false)
  }, [setShowHelpModal])
  /** @type {(_e: unknown, val: number) => void} */
  const handleMinimumBusinessDaysChange = useCallback((_e, val) => {
    setMinimumBusinessDays(val)
  }, [setMinimumBusinessDays])
  const [events, setEvents] = useState(/** @type {Event[]} */([]))
  const [days, setDays] = useState(/** @type {Day[]} */([]))
  const result = useMemo(() => {
    return events.map((event) => ({
      name: event.name,
      date: event.date,
      businessDays: getNumberOfbusinessDaysBetween(new Date(), new Date(event.date), days.map((day) => new Date(day.date)))
    }))
  }, [events, days])
  const filteredResult = useMemo(() => {
    return result.filter((event) => search === "" || event.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.businessDays - b.businessDays)
  }, [result, search])
  const retrieveEvents = useCallback(() => {
    getAllEvents().then(/** @type {(events: Event[]) => void} */((events) => setEvents(events)))
  }, [getAllEvents])
  const retrieveDays = useCallback(() => {
    getAllDays().then(/** @type {(days: Day[]) => void} */((days) => setDays(days)))
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
  const updateEventFormik = useFormik({
    initialValues: {
      id: "",
      name: "",
      date: new Date().toISOString().split("T")[0]
    },
    onSubmit: (/** @type {Event} */ values) => {
      updateEvent(values)
        .then(() => {
          retrieveEvents()
          closeUpdateEventModal()
        })
    }
  })
  const handleOpenUpdateEventModal = useCallback((/** @type {Event} */ event) => {
    updateEventFormik.setValues(event)
    setShowUpdateEventModal(true)
  }, [updateEventFormik, setShowUpdateEventModal])
  const closeUpdateEventModal = useCallback(() => {
    setShowUpdateEventModal(false)
  }, [setShowUpdateEventModal])
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
  const updateDayFormik = useFormik({
    initialValues: {
      id: "",
      name: "",
      date: new Date().toISOString().split("T")[0]
    },
    onSubmit: (/** @type {Day} */ values) => {
      updateDay(values)
        .then(() => {
          retrieveDays()
          closeUpdateDayModal()
        })
    }
  })
  const handleOpenUpdateDayModal = useCallback((/** @type {Day} */ day) => {
    updateDayFormik.setValues(day)
    setShowUpdateDayModal(true)
  }, [updateDayFormik, setShowUpdateDayModal])
  const closeUpdateDayModal = useCallback(() => {
    setShowUpdateDayModal(false)
  }, [setShowUpdateDayModal])
  const importFormik = useFormik({
    initialValues: {
      file: null
    },
    onSubmit: (values) => {
      if (!values.file) {
        return
      }
      const importingNofitication = notifications.show(t("Importing data..."), {
        severity: "info"
      })
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileContent = e.target?.result
        if (fileContent == null || fileContent === "") {
          return
        }
        const rawData = JSON.parse(fileContent.toString())
        const result = DataSchema.safeParse(rawData)
        if (!result.success) {
          notifications.show(t("Invalid data format"), {
            severity: "error",
            autoHideDuration: 2000
          })
          notifications.close(importingNofitication)
          console.error(result.error)
          return
        }
        Promise.all([
          Promise.all(result.data.events.map((event) => addEvent(event))), 
          Promise.all(result.data.days.map((day) => addDay(day)))
        ])
          .then(() => {
            notifications.show(t("Data imported successfully"), {
              severity: "success",
              autoHideDuration: 2000
            })
            retrieveEvents()
            retrieveDays()
            closeImportModal()
          })
          .catch((error) => {
            notifications.show(t("An error occurred while importing data"), {
              severity: "error",
              autoHideDuration: 2000
            })
            console.error(error)
          })
          .finally(() => {
            notifications.close(importingNofitication)
          })
      }
      reader.onerror = (e) => {
        notifications.show(t("An error occurred while reading the file"), {
          severity: "error",
          autoHideDuration: 2000
        })
        notifications.close(importingNofitication)
        console.error(e)
      }
      reader.readAsText(values.file)
    }
  })
  const handleOpenImportModal = useCallback(() => {
    importFormik.resetForm()
    setShowImportModal(true)
  }, [importFormik, setShowImportModal])
  const closeImportModal = useCallback(() => {
    setShowImportModal(false)
  }, [setShowImportModal])
  const handleExport = useCallback(() => {
    const data = {
      events,
      days
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [events, days])
  if (!matches) {
    return (
      <Box height="100%">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {t("Business Days Calculator")}
            </Typography>
            <Box>
              <IconButton color="inherit" href="https://github.com/ismtabo/business-days-to-go" target="_blank" rel="noreferrer">
                <Stack direction="row" spacing={1}>
                  <Typography variant="button">{t("Code")}</Typography>
                  <GitHub />
                </Stack>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Stack height="100%" justifyContent="center" alignItems="center" margin={2}>
          <Typography>{t("This website is not prepared for small screens.")}</Typography>
          <Typography>{t("Please, use a device with a larger screen.")}</Typography>
        </Stack>
      </Box>
    )
  }
  return (
    <Box height="100%">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t("Business Days Calculator")}
          </Typography>
          <Box>
            <IconButton color="inherit" onClick={handleOpenHelpModal}>
              <Tooltip title={t("Open help")}>
                <Stack direction="row" spacing={1}>
                  <Typography variant="button">{t("Help")}</Typography>
                  <Help />
                </Stack>
              </Tooltip>
            </IconButton>
            <IconButton color="inherit" onClick={handleExport}>
              <Tooltip title={t("Export data to file")}>
                <Stack direction="row" spacing={1}>
                  <Typography variant="button">{t("Export")}</Typography>
                  <ImportExport />
                </Stack>
              </Tooltip>
            </IconButton>
            <IconButton color="inherit" onClick={handleOpenImportModal}>
              <Tooltip title={t("Import data from file")}>
                <Stack direction="row" spacing={1}>
                  <Typography variant="button">{t("Import")}</Typography>
                  <ImportContacts />
                </Stack>
              </Tooltip>
            </IconButton>
            <IconButton color="inherit" href="https://github.com/ismtabo/business-days-to-go" target="_blank" rel="noreferrer">
              <Stack direction="row" spacing={1}>
                <Typography variant="button">{t("Code")}</Typography>
                <GitHub />
              </Stack>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box height="85%" padding={4} sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gridTemplateRows: "50% 50%", gridTemplateAreas: "\"events result\" \"days result\"", gap: 2 }}>
        <Box sx={{ gridArea: "events", display: "flex", flexDirection: "column", gap: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h5">{t("Due Dates")}</Typography>
            <Button variant="contained" onClick={handleOpenAddEventModal}>{t("Add Date")}</Button>
          </Stack>
          <Box overflow="auto" sx={{ flex: 1, overflow: "auto" }}>
            <List>
              {
                events.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemText primary={event.name} secondary={event.date} />
                    <IconButton onClick={() => handleOpenUpdateEventModal(event)}>
                      <Edit />
                    </IconButton>
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
            <Typography variant="h5">{t("Non-Working Days")}</Typography>
            <Button variant="contained" onClick={handleOpenDayEventModal}>{t("Add Day")}</Button>
          </Stack>
          <List>
            {
              days.map((day) => (
                <ListItem key={day.id}>
                  <ListItemText primary={day.date} secondary={day.name} />
                  <IconButton onClick={() => handleOpenUpdateDayModal(day)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteDay(day.id)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))
            }
          </List>
        </Box>
        <Stack sx={{ gridArea: "result" }} spacing={2} height="100%">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{t("Closest Due Dates")}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Stack direction="column" spacing={0.5} alignItems="flex-start">
              <InputLabel htmlFor="search">{t("Search")}</InputLabel>
              <TextField size="small" id="search" name="search" value={search} onChange={handleSearchChange} slotProps={{
                input: {
                  endAdornment: <IconButton onClick={handleResetSearch}><Close /></IconButton>
                }
              }}/>
            </Stack>
            <Stack direction="column" spacing={0.5} alignItems="flex-start">
              <InputLabel htmlFor="minimum-business-days">{t("Minimum Business Days")}</InputLabel>
              <NumberInput name="minimum-business-days" value={minimumBusinessDays} onChange={handleMinimumBusinessDaysChange} min={0} max={100}/>
            </Stack>
          </Stack>
          <TableContainer sx={{ flexGrow: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Name")}</TableCell>
                  <TableCell>{t("Due Date")}</TableCell>
                  <TableCell>{t("Business Days")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{overflow: "auto", height: "100%"}}>
                {
                  filteredResult.map((event, i) => (
                    <TableRow key={`event-${i}`} sx={(theme) => ({ backgroundColor: event.businessDays <= minimumBusinessDays ? theme.palette.error.light : undefined })}>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.businessDays}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Box>
      <Modal open={showEventModal} onClose={closeEventModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">{t("Add Due Date")}</Typography>
            <form onSubmit={eventFormik.handleSubmit}>
              <Stack spacing={2}>
                <TextField label={t("Name")} name="name" required value={eventFormik.values.name} onChange={eventFormik.handleChange}/>
                <TextField label={t("Due Date")} type="date" name="date" required value={eventFormik.values.date} onChange={eventFormik.handleChange} inputProps={{min: todayDate}}/>
                <Button variant="contained" type="submit">{t("Add")}</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
      <Modal open={showUpdateEventModal} onClose={closeUpdateEventModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">{t("Update Due Date")}</Typography>
            <form onSubmit={updateEventFormik.handleSubmit}>
              <Stack spacing={2}>
                <TextField label={t("Name")} name="name" required value={updateEventFormik.values.name} onChange={updateEventFormik.handleChange}/>
                <TextField label={t("Due Date")} type="date" name="date" required value={updateEventFormik.values.date} onChange={updateEventFormik.handleChange} slotProps={{htmlInput: {min: todayDate}}}/>
                <Button variant="contained" type="submit">{t("Update")}</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
      <Modal open={showDayModal} onClose={closeDayModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">{t("Add Non-Working Day")}</Typography>
            <form onSubmit={dayFormik.handleSubmit}>
              <Stack spacing={2}>
                <TextField label={t("Date")} type="date" name="date" required value={dayFormik.values.date} onChange={dayFormik.handleChange} slotProps={{htmlInput: {min: todayDate}}}/>
                <TextField label={t("Name")} name="name" required value={dayFormik.values.name} onChange={dayFormik.handleChange}/>
                <Button variant="contained" type="submit">{t("Add")}</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
      <Modal open={showUpdateDayModal} onClose={closeUpdateDayModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">{t("Update Non-Working Day")}</Typography>
            <form onSubmit={updateDayFormik.handleSubmit}>
              <Stack spacing={2}>
                <TextField label={t("Date")} type="date" name="date" required value={updateDayFormik.values.date} onChange={updateDayFormik.handleChange} slotProps={{htmlInput: {min: todayDate}}}/>
                <TextField label={t("Name")} name="name" required value={updateDayFormik.values.name} onChange={updateDayFormik.handleChange}/>
                <Button variant="contained" type="submit">{t("Update")}</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
      <Modal open={showImportModal} onClose={closeImportModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">{t("Import")}</Typography>
            <form onSubmit={importFormik.handleSubmit}>
              <Stack spacing={2}>
                <InputLabel htmlFor="file">{t("File")}</InputLabel>
                <TextField type="file" name="file" required onChange={(e) => {
                  importFormik.setFieldValue("file", /** @type {any} */(e.target)?.files[0])
                }}/>
                <Button variant="contained" type="submit">{t("Import Data")}</Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Modal>
      <Modal open={showHelpModal} onClose={closeHelpModal} aria-labelledby="add-event-modal" aria-describedby="add-event-modal-description">
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6">{t("Help")}</Typography>
            <Typography variant="body1">{t("Help_paragraph_1")}</Typography>
            <Typography variant="body1">{t("Help_paragraph_2")}</Typography>
            <Typography variant="body1">{t("Help_paragraph_3")}</Typography>
            <Typography variant="body1">{t("Help_paragraph_4")}</Typography>
            <Typography variant="body1">{t("Help_paragraph_5")}</Typography>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}

export default App
