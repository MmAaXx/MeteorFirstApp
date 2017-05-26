import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
 
import { Event } from '../api/event.js';
import Calendar from './Calendar.jsx';
 
// App component - represents the whole app
class App extends Component {
  constructor() {
    super();
    
    this.onCreateEvent = this.onCreateEvent.bind(this);
    this.onEditEvent = this.onEditEvent.bind(this);
    this.onDeleteEvent = this.onDeleteEvent.bind(this);
  }

  onCreateEvent(title, startDate, endDate) {
    Event.insert({
				title: title,
				startDate: startDate,
				endDate: endDate
		});
  }

  onDeleteEvent(id) {
    Event.remove(id);
  }

  onEditEvent(id, title, startDate, endDate) {
    Event.update(id, {
      $set: { 
        title: title,
				startDate: startDate,
				endDate: endDate
      },
    });
  }

   render() {
    return (
      <Calendar events={this.props.events} onCreateEvent={this.onCreateEvent}
          onEditEvent={this.onEditEvent} onDeleteEvent={this.onDeleteEvent} />
    );
  }
}

App.propTypes = {
  events: PropTypes.array.isRequired,
};
 
export default createContainer(() => {
  return {
    events: Event.find({}).fetch(),
  };
}, App);