'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Phone, Mail, Send, Search, Plus, Clock } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Manage customer communications and team collaboration</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
              <DialogDescription>
                Create a new message to send to customers or team members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">To</label>
                <Input placeholder="Enter recipient email or phone number" />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Message subject" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Type your message here..." rows={4} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Inbox
            <Badge variant="secondary">23</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {/* Message List */}
            <div className="lg:col-span-1 space-y-2">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-sm">Sarah Johnson</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 min ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Installation timeline question</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Hi, I wanted to follow up on the installation timeline we discussed...
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">Customer</Badge>
                    <Mail className="h-3 w-3 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-sm">Mike Chen</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Project update needed</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Can you provide an update on the Johnson project status for the weekly report...
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">Team</Badge>
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">David Rodriguez</span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 hours ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Proposal feedback</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Thank you for the detailed proposal. I have a few questions about the financing options...
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">Customer</Badge>
                    <Phone className="h-3 w-3 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Installation timeline question</CardTitle>
                      <CardDescription>From: Sarah Johnson &lt;sarah.johnson@email.com&gt;</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Customer</Badge>
                      <span className="text-sm text-muted-foreground">2 min ago</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p>Hi there,</p>
                    <p>
                      I wanted to follow up on the installation timeline we discussed during our last call.
                      My family is planning a vacation in early December, and I want to make sure the installation
                      will be completed before then.
                    </p>
                    <p>
                      Could you please confirm if the November 15th installation date is still on track?
                      Also, what should I expect in terms of preparation on my end?
                    </p>
                    <p>Thanks for your help!</p>
                    <p>Best regards,<br />Sarah Johnson</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Quick Reply</h4>
                    <div className="space-y-3">
                      <Textarea placeholder="Type your reply..." rows={4} />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Add Template</Button>
                          <Button variant="outline" size="sm">Attach File</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Save Draft</Button>
                          <Button size="sm" className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>Messages you&apos;ve sent to customers and team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Your sent messages will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Messages</CardTitle>
              <CardDescription>Messages saved as drafts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No draft messages found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Message Templates</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Welcome Message</CardTitle>
                <CardDescription className="text-xs">For new customers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Welcome to Quantum Solar! We&apos;re excited to help you with your solar journey...
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Installation Reminder</CardTitle>
                <CardDescription className="text-xs">Pre-installation checklist</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Your solar installation is scheduled for tomorrow. Here&apos;s what to expect...
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Follow-up Message</CardTitle>
                <CardDescription className="text-xs">Post-installation follow-up</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Thank you for choosing Quantum Solar. How is your new system performing...
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}