'use client';

import { useState, useEffect } from 'react';
import { Plus, Building2, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { getAHJs } from '../actions';
import { CreateAHJDialog } from '@/components/crm/CreateAHJDialog';
import { EditAHJDialog } from '@/components/crm/EditAHJDialog';
import type { AHJ } from '@/types/crm';

function AHJTable() {
  const [ahjs, setAhjs] = useState<AHJ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAHJs({ activeOnly: false }).then((data) => {
      setAhjs(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <p className="text-gray-400">Loading AHJ records...</p>
      </div>
    );
  }

  if (!ahjs || ahjs.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No AHJ Records Found</h3>
        <p className="text-gray-400 mb-4">
          Add Authority Having Jurisdiction records to track permitting requirements and inspector details.
        </p>
        <CreateAHJDialog>
          <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add AHJ
          </Button>
        </CreateAHJDialog>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800/50">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Location</TableHead>
            <TableHead className="text-gray-400">Contact</TableHead>
            <TableHead className="text-gray-400">Requirements</TableHead>
            <TableHead className="text-gray-400">Permit Time</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ahjs.map((ahj) => (
            <TableRow
              key={ahj.id}
              className="border-gray-700 hover:bg-gray-800/30 cursor-pointer"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">{ahj.name}</p>
                    {ahj.inspector_name && (
                      <p className="text-sm text-gray-400">
                        Inspector: {ahj.inspector_name}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {ahj.county && `${ahj.county}, `}
                    {ahj.state}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {ahj.building_department_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <a
                        href={`tel:${ahj.building_department_phone}`}
                        className="hover:text-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ahj.building_department_phone}
                      </a>
                    </div>
                  )}
                  {ahj.building_department_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="h-3 w-3 text-gray-500" />
                      <a
                        href={`mailto:${ahj.building_department_email}`}
                        className="hover:text-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ahj.building_department_email}
                      </a>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {ahj.requires_tech_on_site && (
                    <Badge
                      variant="outline"
                      className="text-xs text-orange-400 border-orange-500"
                    >
                      Tech On-Site
                    </Badge>
                  )}
                  {ahj.requires_rough_inspection && (
                    <Badge
                      variant="outline"
                      className="text-xs text-yellow-400 border-yellow-500"
                    >
                      Rough Inspection
                    </Badge>
                  )}
                  {ahj.requires_electrical_inspection && (
                    <Badge
                      variant="outline"
                      className="text-xs text-blue-400 border-blue-500"
                    >
                      Electrical
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {ahj.typical_permit_turnaround_days ? (
                  <span className="text-gray-300">
                    {ahj.typical_permit_turnaround_days} days
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </TableCell>

              <TableCell>
                {ahj.active ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Inactive</span>
                  </div>
                )}
              </TableCell>

              <TableCell className="text-right">
                <EditAHJDialog ahj={ahj}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Button>
                </EditAHJDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AHJPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AHJ Management</h1>
          <p className="text-gray-400 mt-1">
            Manage Authority Having Jurisdiction records for permitting and inspections
          </p>
        </div>
        <CreateAHJDialog>
          <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add AHJ
          </Button>
        </CreateAHJDialog>
      </div>

      {/* AHJ Table */}
      <AHJTable />
    </div>
  );
}
