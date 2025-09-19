'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Users, MapPin, Phone } from "lucide-react";

export default function CalendarPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate calendar days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const calendarDays = getDaysInMonth(currentDate);
  const today = new Date().getDate();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Manage appointments, installations, and team schedules</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Schedule a new appointment or meeting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input placeholder="Enter event title" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Site Consultation</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="meeting">Team Meeting</SelectItem>
                    <SelectItem value="call">Customer Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Customer/Attendee</label>
                <Input placeholder="Enter customer name or email" />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="Enter address or location" />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea placeholder="Additional notes..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Create Event</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="month" className="space-y-4">
        <TabsList>
          <TabsTrigger value="month">Month View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{currentMonth}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">Today</Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.getDate() === today && isCurrentMonth;
                  const hasEvents = isCurrentMonth && [5, 12, 18, 25].includes(day.getDate());

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-1 border border-border rounded-sm cursor-pointer hover:bg-muted/50 ${
                        !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''
                      } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
                    >
                      <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                        {day.getDate()}
                      </div>
                      {hasEvents && (
                        <div className="space-y-1 mt-1">
                          {day.getDate() === 5 && (
                            <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                              Site Visit - Johnson
                            </div>
                          )}
                          {day.getDate() === 12 && (
                            <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate">
                              Installation - Chen
                            </div>
                          )}
                          {day.getDate() === 18 && (
                            <div className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded truncate">
                              Team Meeting
                            </div>
                          )}
                          {day.getDate() === 25 && (
                            <div className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded truncate">
                              Inspection - Wilson
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Week of November 10-16, 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Week view coming soon</p>
                <p className="text-sm text-muted-foreground">Enhanced calendar features in development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today - {currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Site Consultation - Johnson Residence</h4>
                    <Badge variant="outline">09:00 AM</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    123 Oak Street, Springfield, IL
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    (555) 123-4567
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Team Standup Meeting</h4>
                    <Badge variant="outline">11:00 AM</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Users className="h-3 w-3" />
                    Conference Room A / Zoom
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Installation Follow-up Call - Chen Project</h4>
                    <Badge variant="outline">02:30 PM</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    30 minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="text-center">
                      <div className="text-sm font-medium">Nov</div>
                      <div className="text-lg font-bold">15</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Installation - Wilson Home</p>
                      <p className="text-xs text-muted-foreground">8:00 AM - 4:00 PM</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Install</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="text-center">
                      <div className="text-sm font-medium">Nov</div>
                      <div className="text-lg font-bold">16</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Site Survey - Davis Property</p>
                      <p className="text-xs text-muted-foreground">10:00 AM - 11:30 AM</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Survey</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="text-center">
                      <div className="text-sm font-medium">Nov</div>
                      <div className="text-lg font-bold">18</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Weekly Team Meeting</p>
                      <p className="text-xs text-muted-foreground">9:00 AM - 10:00 AM</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Meeting</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Installation Schedule</CardTitle>
                  <CardDescription>Current and upcoming solar installations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Wilson Residence - 8.5kW System</h4>
                        <p className="text-sm text-muted-foreground">456 Maple Ave, Springfield, IL</p>
                        <p className="text-sm text-muted-foreground">Crew: Team Alpha (4 technicians)</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Tomorrow</Badge>
                        <p className="text-sm text-muted-foreground mt-1">8:00 AM - 4:00 PM</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Rodriguez Home - 12.2kW System</h4>
                        <p className="text-sm text-muted-foreground">789 Pine St, Decatur, IL</p>
                        <p className="text-sm text-muted-foreground">Crew: Team Beta (5 technicians)</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Nov 20</Badge>
                        <p className="text-sm text-muted-foreground mt-1">7:30 AM - 5:00 PM</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Thompson Property - 15.8kW System</h4>
                        <p className="text-sm text-muted-foreground">321 Cedar Dr, Peoria, IL</p>
                        <p className="text-sm text-muted-foreground">Crew: Team Alpha + Team Beta (8 technicians)</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Nov 25</Badge>
                        <p className="text-sm text-muted-foreground mt-1">7:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}