import { useState, useMemo } from "react";
import { ContainerItem } from "@/lib/types";
import { LayoutShell } from "@/components/LayoutShell";
import { ContainersList } from "@/components/ContainersList";
import { StatusFilterTabs, StatusFilter } from "@/components/StatusFilterTabs";
import { BookingModal } from "@/components/BookingModal";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useContainers } from "@/hooks/useContainers";

export default function EnterprisePage() {
  const { data: containers = [], isLoading } = useContainers();
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContainers = useMemo(() => {
    return containers.filter((container) => {
      if (statusFilter === "arrived" && !container.arrived) return false;
      if (statusFilter === "not-arrived" && container.arrived) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return container.id.toLowerCase().includes(query);
      }
      
      return true;
    });
  }, [containers, statusFilter, searchQuery]);

  const handleContainerClick = (container: ContainerItem) => {
    if (!container.arrived) {
      toast({
        title: "Not Available",
        description: "This container has not arrived yet.",
      });
      return;
    }

    setSelectedContainerId(container.id);

    if (container.scheduled) {
      toast({
        title: "Already Scheduled",
        description: `Appointment scheduled for ${container.appointmentDate} at ${container.appointmentHour}`,
      });
      return;
    }

    setSelectedContainer(container);
    setIsModalOpen(true);
  };

  const handleBookingComplete = () => {
    setIsModalOpen(false);
  };

  return (
    <LayoutShell showSidebar={false}>
      <div className="space-y-6">
        <div className="glass-primary-panel p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Portly</h1>
            <p className="text-muted-foreground">
              Modern port operations platform for container arrivals and appointments.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search by container ID..."
              className="max-w-xs h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <StatusFilterTabs
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
          </div>
        </div>

        <div className="glass-primary-panel overflow-hidden">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading containers...
            </div>
          ) : (
            <ContainersList
              containers={filteredContainers}
              onContainerClick={handleContainerClick}
              selectedContainerId={selectedContainerId}
            />
          )}
        </div>

        <BookingModal
          container={selectedContainer}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onBookingComplete={handleBookingComplete}
        />
      </div>
    </LayoutShell>
  );
}
