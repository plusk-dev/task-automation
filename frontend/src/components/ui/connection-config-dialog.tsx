"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { AlertCircle } from "lucide-react";
import { integrationConnectionUtils } from "@/lib/utils";

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

interface ConnectionConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: IntegrationConnection | null;
  onConnectionUpdated?: () => void;
  onConnectionRemoved?: () => void;
}

export function ConnectionConfigDialog({
  open,
  onOpenChange,
  connection,
  onConnectionUpdated,
  onConnectionRemoved
}: ConnectionConfigDialogProps) {


  const handleRemoveConnection = () => {
    if (!connection) return;
    
    if (confirm(`Are you sure you want to disconnect ${connection.integration.name}?`)) {
      integrationConnectionUtils.removeConnection(connection.integration.id);
      onConnectionRemoved?.();
      onOpenChange(false);
    }
  };


  if (!connection) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src={connection.integration.icon}
              alt={connection.integration.name}
              className="w-6 h-6 rounded object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {connection.integration.name} Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">

          {/* API Base URL */}
          <div className="space-y-2">
            <Label htmlFor="api_base">API Base URL</Label>
            <Input
              value={connection.api_base}
              readOnly
              className="font-mono bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              The base URL for this integration's API endpoints
            </p>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <Label htmlFor="headers">Headers</Label>
            <div className="w-full max-h-40 p-3 border rounded-md font-mono text-sm bg-muted overflow-auto whitespace-pre-wrap break-words">
              {JSON.stringify(connection.headers, null, 2)}
            </div>
          </div>

        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleRemoveConnection}
          >
            Disconnect
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
