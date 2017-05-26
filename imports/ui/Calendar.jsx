import 'react-date-picker/index.css'
import React, { Component, PropTypes } from 'react';
import { Modal, Button, ControlLabel, FormGroup, FormControl } from 'react-bootstrap';
import $ from 'jquery';
import { DateField, DatePicker } from 'react-date-picker';

export default class Calendar extends React.Component {
	constructor() {
		super();

		// Store date in timestamp because setHours always return a timestamp.
		this.state = {
			showModal: false,
			modalTitle: "Create an event",
			events: null
		};

		this.createButtonClicked = this.createButtonClicked.bind(this);
		this.startDateChange = this.startDateChange.bind(this);
		this.endDateChange = this.endDateChange.bind(this);
		this.close = this.close.bind(this);
		this.save = this.save.bind(this);
		this.handleChangeTitle = this.handleChangeTitle.bind(this);
		this.treatEvents = this.treatEvents.bind(this);
		this.addEventsToCalendar = this.addEventsToCalendar.bind(this);
		this.eventClickedCallback = this.eventClickedCallback.bind(this);
		this.delete = this.delete.bind(this);
	}

	componentDidMount() {
		var that = this;

		$('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: ''
			},
			height: 700,
			width: 700,
			editable: true,
			droppable: true, // this allows things to be dropped onto the calendar
			timezone: "local",
			eventClick: function(calEvent, jsEvent, view) {
				that.eventClickedCallback({
					title: calEvent.title,
					startDate: calEvent.start.toDate().getTime(),
					endDate: calEvent.end.toDate().getTime(),
					id: calEvent.id,
				});
			},
			eventDrop: function(event, delta, revertFunc) {
				that.editEvent(event.id, event.title, event.start.toDate().getTime(), event.end.toDate().getTime());
			}
		})
	}

	/** FullCalendar functions */

	eventClickedCallback(event) {
		this.setState({
			showModal: true,
			modalEditMode: true,
			modalTitle: "Edit event : " + event.title,
			eventTitle: event.title,
			eventStartDate: event.startDate,
			eventEndDate: event.endDate,
			eventId: event.id,
		});
	}

	treatEvents(events) {
		const functionName = "Calendar.treatEvents => ";

		this.deleteAllEvents();
		this.addEventsToCalendar(events);
	}

	getEvents() {
		return $("#calendar").fullCalendar('clientEvents');
	}

	addEventsToCalendar(events) {
		for (var i in events) {
			var event = events[i];

			var parsedEvent = this.parseEvent(event);

			$("#calendar").fullCalendar('renderEvent', parsedEvent);
		}
	}

	deleteAllEvents() {
		$("#calendar").fullCalendar('removeEvents');
	}

	parseEvent(event) {
		return {
			title: event.title,
			start: event.startDate,
			end: event.endDate,
			id: event._id
		};
	}

	/** End FullCalendar functions */
	/** Modal functions */

	save() {
		if (this.state.modalEditMode) {
			this.editEvent(this.state.eventId, this.state.eventTitle, this.state.eventStartDate, this.state.eventEndDate);
			this.setState({
				showModal: false
			});

			return;
		}

		// Else : create.
		this.props.onCreateEvent(this.state.eventTitle, this.state.eventStartDate, this.state.eventEndDate);
		this.setState({
			showModal: false
		});
	}

	editEvent(id, title, startDate, endDate) {
		this.props.onEditEvent(id, title, startDate, endDate);
	}

	delete() {
		this.props.onDeleteEvent(this.state.eventId);
		this.setState({
			showModal: false
		});
	}

	close() {
		this.setState({ showModal: false });
	}

	createButtonClicked() {
		var currentDate = new Date();
		var endDate = new Date().setHours(currentDate.getHours() + 1, currentDate.getMinutes(), currentDate.getSeconds());

		this.setState({
			showModal: true,
			modalEditMode: false,
			eventTitle: "",
			eventStartDate: currentDate.getTime(),
			eventEndDate: endDate,
		});
	}

	startDateChange(e) {
		var startDate = new Date(e).getTime();
		var endDate = this.state.eventEndDate;

		if (startDate > endDate) {
			endDate = startDate + (60*60*1000);
		}

		this.setState({
			eventStartDate: new Date(e).getTime(),
			eventEndDate: endDate,
		});
	}

	endDateChange(e) {
		var enDate = new Date(e).getTime();
		var startDate = this.state.eventStartDate;

		if (endDate < startDate) {
			startDate = endDate - (60*60*1000);
		}
		this.setState({
			eventEndDate: new Date(e).getTime(),
			eventStartDate: startDate,
		});
	}

	handleChangeTitle(e) {
		this.setState({
			eventTitle: e.target.value
		});
	}

	/** End Modal functions */

	render() {
		if (!this.state.showModal && this.props.events.length > 0) {
			this.treatEvents(this.props.events);
		}

		var deleteButton = ""; 
		if (this.state.modalEditMode) {
			deleteButton = <Button bsStyle="danger" onClick={this.delete}>Delete</Button>
		}

		return (
			<div>
				<div id="calendar"></div>
				<Button id="create_event" onClick={this.createButtonClicked}>Create Event</Button>

				<Modal show={this.state.showModal} onHide={this.close}>
					<Modal.Header closeButton>
						<Modal.Title>{this.state.modalTitle}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<FormGroup controlId="title">
								<ControlLabel>Title</ControlLabel>
								<FormControl
									type="text"
									value={this.state.eventTitle}
									placeholder="Enter text"
									onChange={this.handleChangeTitle}
								/>
								<FormControl.Feedback />
							</FormGroup>
							<FormGroup controlId="startDate">
								<ControlLabel>Starting Date</ControlLabel>
								<DateField dateFormat="YYYY-MM-DD HH:mm:ss"
									forceValidDate={true}
									defaultValue={this.state.eventStartDate}
									onChange={this.startDateChange}>
									<DatePicker
										navigation={true}
										locale="fr"
										forceValidDate={true}
										highlightWeekends={true}
										highlightToday={true}
										weekNumbers={true}
										weekStartDay={0}
									/>
								</DateField>
							</FormGroup>
							<FormGroup controlId="endDate">
								<ControlLabel>Ending Date</ControlLabel>
								<DateField dateFormat="YYYY-MM-DD HH:mm:ss"
									forceValidDate={true}
									defaultValue={this.state.eventEndDate}
									onChange={this.endDateChange}>
									<DatePicker
										navigation={true}
										locale="fr"
										forceValidDate={true}
										highlightWeekends={true}
										highlightToday={true}
										weekNumbers={true}
										weekStartDay={0}
									/>
								</DateField>
							</FormGroup>
						</form>
					</Modal.Body>
					<Modal.Footer>
						{deleteButton}
						<Button onClick={this.save}>Save</Button>
						<Button onClick={this.close}>Close</Button>
					</Modal.Footer>
				</Modal>
			</div>
		);
	}
}