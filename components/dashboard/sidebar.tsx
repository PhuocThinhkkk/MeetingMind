'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Settings, 
  Calendar, 
  MessageSquare, 
  FileText,
  TrendingUp,
  LogOut,
  Bell,
  Archive,
  Search
} from 'lucide-react';

interface SidebarProps {
  selectedFile: any;
  onFileSelect: (file: any) => void;
}

export function Sidebar({ selectedFile, onFileSelect }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const recentActivity = [
    { type: 'transcription', title: 'Team Meeting transcribed', time: '2 minutes ago' },
    { type: 'summary', title: 'AI summary generated', time: '5 minutes ago' },
    { type: 'event', title: 'Calendar event created', time: '1 hour ago' },
    { type: 'qa', title: 'Question answered', time: '2 hours ago' }
  ];

  const upcomingEvents = [
    { title: 'Project Review', time: 'Today, 3:00 PM', location: 'Conference Room A' },
    { title: 'Client Presentation', time: 'Tomorrow, 10:00 AM', location: 'Zoom' },
    { title: 'Team Standup', time: 'Friday, 9:00 AM', location: 'Office' }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-hidden animate-slide-left">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">John Doe</h3>
            <p className="text-sm text-gray-500">john@example.com</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 m-4">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-4 space-y-4">
            <TabsContent value="overview" className="mt-0">
              {/* Quick Stats */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">This Week</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Meetings</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hours Transcribed</span>
                    <Badge variant="secondary">8.5h</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Summaries</span>
                    <Badge variant="secondary">9</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Search Transcripts
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Archive className="w-4 h-4 mr-2" />
                    View Archive
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">You have 3 pending action items from this week's meetings.</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">Meeting efficiency improved by 15% this month!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-500">{event.time}</p>
                        <p className="text-xs text-gray-500">{event.location}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full mt-4">
                <Calendar className="w-4 h-4 mr-2" />
                View Full Calendar
              </Button>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100">
        <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}