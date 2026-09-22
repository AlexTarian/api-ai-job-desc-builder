window.JOB_CONFIG = {
  categories: {
    equipment: {
      label: "Agricultural Equipment Operation",
      icon: "icons/equipment.svg",
      duties: [
        { id: "operate-tractors", label: "Operate tractors and farm vehicles" },
        { id: "operate-tillage", label: "Operate tillage and soil-preparation equipment" },
        { id: "operate-planting", label: "Operate planting and seeding equipment" },
        { id: "operate-cultivating", label: "Operate cultivating equipment" },
        { id: "operate-harvesting", label: "Operate harvesting equipment" },
        { id: "operate-spreading", label: "Operate fertilizer, manure, or other spreading equipment" },
        { id: "operate-irrigation", label: "Operate irrigation equipment" },
        { id: "material-handling", label: "Operate forklifts, augers, conveyors, or other material-handling equipment" },
        { id: "load-equipment", label: "Load or unload crops, materials, or supplies using equipment" },
        { id: "transport-farm", label: "Transport crops, materials, supplies, or equipment around the farm" },
        { id: "specialized-equipment", label: "Operate specialized agricultural equipment" },
        { id: "prepare-equipment", label: "Inspect, clean, adjust, and prepare equipment for operation" }
      ]
    },

    beekeeping: {
      label: "Beekeeping",
      icon: "icons/beekeeper.svg",
      duties: [
        { id: "maintain-hives", label: "Assemble, prepare, or maintain hives" },
        { id: "care-colonies", label: "Handle and care for live bee colonies" },
        { id: "feed-colonies", label: "Feed or supplement bee colonies" },
        { id: "monitor-colonies", label: "Monitor colony health" },
        { id: "treat-bees", label: "Medicate or treat bees" },
        { id: "manage-queens", label: "Manage queens and queen cells" },
        { id: "handle-supers", label: "Add, remove, or handle hive boxes and supers" },
        { id: "harvest-combs", label: "Harvest and uncap honeycombs" },
        { id: "extract-honey", label: "Extract or process honey" },
        { id: "transport-hives", label: "Move or transport hives, bee boxes, or harvested honey" }
      ]
    },

    piloting: {
      label: "Commercial Piloting",
      icon: "icons/equipment.svg",
      duties: []
    },

    construction: {
      label: "Construction",
      icon: "icons/construction.svg",
      duties: []
    },

    farmwork: {
      label: "Crop Farmwork",
      icon: "icons/farmer.svg",
      duties: [
        { id: "prepare-soil", label: "Prepare, till, or condition soil" },
        { id: "plant", label: "Plant or transplant crops" },
        { id: "cultivate", label: "Cultivate crops" },
        { id: "weed", label: "Weed crops" },
        { id: "thin-prune", label: "Thin or prune crops" },
        { id: "irrigate", label: "Irrigate crops" },
        { id: "fertilize", label: "Apply fertilizer or soil amendments" },
        { id: "monitor-crops", label: "Monitor crops for growth, maturity, pests, disease, or other problems" },
        { id: "hand-harvest", label: "Harvest crops by hand" },
        { id: "grade-sort", label: "Grade or sort crops" },
        { id: "pack-crops", label: "Clean, pack, or prepare crops for storage or shipment" },
        { id: "move-crops", label: "Load, unload, or move crops, plants, containers, or farm materials" },
        { id: "post-harvest", label: "Perform post-harvest handling or storage activities" },
        { id: "nursery-greenhouse", label: "Perform nursery or greenhouse production work" },
        { id: "crop-records", label: "Maintain crop or production records" }
      ]
    },

    livestock: {
      label: "Livestock Work",
      icon: "icons/livestock.svg",
      duties: []
    },

    maintenance: {
      label: "Maintenance and Repair",
      icon: "icons/maintenance.svg",
      duties: [
        { id: "inspect-maintenance", label: "Inspect equipment, machinery, vehicles, or facilities for maintenance needs" },
        { id: "routine-maintenance", label: "Perform routine maintenance and servicing on farm machinery or equipment" },
        { id: "diagnose-mechanical", label: "Diagnose mechanical problems" },
        { id: "repair-machinery", label: "Repair farm machinery or equipment" },
        { id: "maintain-vehicles", label: "Maintain or repair farm vehicles" },
        { id: "maintain-irrigation", label: "Maintain or repair irrigation, plumbing, or sprinkler systems" },
        { id: "maintain-structures", label: "Maintain or repair agricultural buildings, pens, yards, or other structures" },

        {
          id: "repair-fences",
          label: "Repair existing fences or gates"
        },

        {
          id: "build-fences",
          label: "Build or install new fences or gates",
          riskTags: ["occupation-review", "fence-construction"]
        },

        { id: "welding", label: "Perform welding or metal fabrication" },
        { id: "electrical-repair", label: "Repair or replace electrical components or wiring" },
        { id: "engine-repair", label: "Perform engine repair or overhaul" },
        { id: "grounds", label: "Maintain grounds or landscaping" }
      ]
    },

    chemical: {
      label: "Pesticide Handling, Spraying, and Application",
      icon: "icons/chemical.svg",
      duties: []
    },

    supervision: {
      label: "Supervision",
      icon: "icons/supervisor.svg",
      duties: [
        { id: "assign-work", label: "Assign work and direct workers" },
        { id: "schedule-crews", label: "Plan or schedule crews and daily work" },
        { id: "train-workers", label: "Train workers in job duties, equipment use, or work procedures" },
        { id: "monitor-performance", label: "Monitor worker performance and work quality" },
        { id: "monitor-safety", label: "Monitor and enforce workplace safety requirements" },
        { id: "inspect-operations", label: "Inspect crops, livestock, fields, facilities, or equipment to determine work needs" },
        { id: "coordinate-resources", label: "Coordinate workers, equipment, supplies, or transportation between locations" },
        { id: "oversee-production", label: "Coordinate or oversee production activities" },
        { id: "resolve-problems", label: "Identify and resolve operational problems" },
        { id: "manager-communication", label: "Communicate with managers about production needs, schedules, or conditions" },
        { id: "supervisory-records", label: "Maintain time, payroll, personnel, production, or other supervisory records" },
        { id: "coordinate-supplies", label: "Requisition or coordinate needed equipment and supplies" }
      ]
    },

    trucking: {
      label: "Trucking",
      icon: "icons/trucking.svg",
      duties: []
    }
  }
};

console.log("job-config.js loaded:", window.JOB_CONFIG);
