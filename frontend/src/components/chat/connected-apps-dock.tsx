"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Link
} from "lucide-react";
import { IntegrationDialog } from "@/components/ui/integration-dialog";
import { ConnectionConfigDialog } from "@/components/ui/connection-config-dialog";

interface Integration {
  id: number;
  name: string;
  description: string;
  uuid: string;
  icon: string;
  limit: number;
  auth_structure: {
    name: string;
    loc: string;
    format: string;
  };
  created: string;
}

interface IntegrationConnection {
  integration: Integration;
  headers: Record<string, string>;
  api_base: string;
  connectedAt: string;
}

interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  type: "linear" | "stripe" | "github" | "slack" | "notion";
}

interface ConnectedAppsDockProps {
  connectedApps: ConnectedApp[];
  connections: IntegrationConnection[];
  onAddApp: () => void;
  onAppClick: (app: ConnectedApp) => void;
  onAppSettings: (app: ConnectedApp) => void;
  onConnectIntegration?: (connection: IntegrationConnection) => void;
  onConnectionUpdated?: () => void;
}

export function ConnectedAppsDock({ 
  connectedApps,
  connections,
  onAddApp, 
  onAppClick, 
  onAppSettings,
  onConnectIntegration,
  onConnectionUpdated
}: ConnectedAppsDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<IntegrationConnection | null>(null);

  const handleAddApp = () => {
    setIntegrationDialogOpen(true);
  };

  const handleConnectIntegration = (connection: IntegrationConnection) => {
    onConnectIntegration?.(connection);
  };

  const handleAppClick = (app: ConnectedApp) => {
    const appIdNum = parseInt(app.id.replace('connected-', ''));
    const connection = connections.find(conn => conn.integration.id === appIdNum);
    
    if (connection) {
      setSelectedConnection(connection);
      setConfigDialogOpen(true);
    } else {
      onAppClick(app);
    }
  };

  if (connectedApps.length === 0) {
    return (
      <>
        <div className="px-4 py-6 border-b">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16rounded-full flex items-center justify-center mb-4">
              <Link className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No apps connected</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Connect your favorite apps to streamline your workflow and automate tasks.
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddApp}
              className="h-9 px-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect App
            </Button>
          </div>
        </div>
        
        <IntegrationDialog
          open={integrationDialogOpen}
          onOpenChange={setIntegrationDialogOpen}
          onConnectIntegration={handleConnectIntegration}
        />
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Connected Apps
            </span>
            <Badge variant="secondary" className="text-xs">
              {connectedApps.length} apps
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddApp}
              className="h-8 px-3"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add App
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {connectedApps.map((app) => (
            <div
              key={app.id}
              className="flex-shrink-0"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAppClick(app)}
                className="h-12 px-3 flex items-center gap-2 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="text-xs font-semibold text-primary hidden">
                    {app.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium">{app.name}</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <IntegrationDialog
        open={integrationDialogOpen}
        onOpenChange={setIntegrationDialogOpen}
        onConnectIntegration={handleConnectIntegration}
      />
      
      <ConnectionConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        connection={selectedConnection}
        onConnectionUpdated={onConnectionUpdated}
        onConnectionRemoved={onConnectionUpdated}
      />
    </>
  );
} 