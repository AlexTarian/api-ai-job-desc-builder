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
        { id: "operate-material-handling", label: "Operate material-handling equipment, such as forklifts, augers, or conveyors" },
        { id: "equipment-load-unload", label: "Load and unload crops, materials, or supplies using equipment" },
        { id: "farm-transport", label: "Transport materials, supplies, or equipment around the farm" },
        { id: "operate-specialized-equipment", label: "Transport harvested commodities to elevator/storage" },
        { id: "prepare-equipment", label: "Inspect, clean, maintain, and prepare agricultural equipment" }
      ]
    },

    beekeeping: {
      label: "Beekeeping",
      icon: "icons/beekeeper.svg",
      duties: [
        { id: "prepare-hives", label: "Assemble, prepare, or maintain hives" },
        { id: "handle-colonies", label: "Handle and care for live bee colonies" },
        { id: "feed-bees", label: "Feed or supplement bee colonies" },
        { id: "monitor-colony-health", label: "Monitor colony health" },
        { id: "treat-bees", label: "Medicate or treat bees" },
        { id: "manage-queens", label: "Manage queens and queen cells" },
        { id: "handle-supers", label: "Add, remove, or handle hive boxes and supers" },
        { id: "harvest-honeycomb", label: "Harvest and uncap honeycombs" },
        { id: "extract-honey", label: "Extract and/or process honey" },
        { id: "transport-hives", label: "Transport hives, bee boxes, or harvested honey" }
      ]
    },
    
    construction: {
      label: "Construction",
      icon: "icons/construction.svg",
      duties: [
        { id: "prepare-construction-site", label: "Prepare and clean construction sites" },
        { id: "build-ag-structures", label: "Build agricultural buildings or structures" },
        { id: "excavate-grade", label: "Dig trenches, excavate, backfill, or grade ground" },
        { id: "concrete-forms", label: "Build and remove concrete forms" },
        { id: "concrete-work", label: "Mix, pour, place, or finish concrete" },
        { id: "structural-components", label: "Install or assemble structural components" },
        { id: "install-piping", label: "Install agricultural water, sewer, drainage, or similar piping" },
        { id: "temporary-structures", label: "Erect or dismantle temporary structures, scaffolding, or bracing" },
        { id: "coatings-sealants", label: "Apply protective coatings, sealants, paint, or similar materials" },
        { id: "construction-equipment", label: "Operate construction tools and equipment" },
        { id: "move-construction-materials", label: "Load, unload, and move construction materials" },
        { id: "read-plans", label: "Read plans, measurements, or specifications" },
        { id: "assist-skilled-trades", label: "Assist carpenters, masons, or other skilled tradespeople" },
        { id: "demolition", label: "Demolish structures or remove and salvage materials" }
      ]
    },

    piloting: {
      label: "Crop Dusting",
      icon: "icons/pilot.svg",
      duties: [
        { id: "aircraft-preflight", label: "Inspect aircraft and conduct pre-flight checks" },
        { id: "flight-planning", label: "Plan flights, routes, altitudes, loads, and fuel requirements" },
        { id: "pilot-aircraft", label: "Pilot aircraft" },
        { id: "aerial-application", label: "Perform agricultural aerial application" },
        { id: "specialized-flights", label: "Perform aerial surveying, monitoring, or other specialized flights" },
        { id: "monitor-aircraft", label: "Monitor aircraft systems and conditions during flight" },
        { id: "flight-coordination", label: "Communicate and coordinate with ground crews and air traffic control" },
        { id: "aircraft-cargo", label: "Load, inspect, or manage aircraft cargo" },
        { id: "flight-records", label: "Maintain flight and aircraft records" },
        { id: "pilot-instruction", label: "Provide pilot instruction, evaluation, or supervision" },
        { id: "aircraft-maintenance", label: "Maintain aircraft" },
        { id: "maintain-flight-facilities", label: "Prepare or maintain runways, hangars, or grounds" },
        { id: "fuel-load-aircraft", label: "Fuel and load planes prior to takeoff or between flights" }
      ]
    },


    farmwork: {
      label: "Crop Farmwork",
      icon: "icons/farmer.svg",
      duties: [
        { id: "prepare-soil", label: "Prepare, till, or condition soil" },
        { id: "plant-crops", label: "Plant or transplant crops" },
        { id: "cultivate-crops", label: "Cultivate crops" },
        { id: "weed-crops", label: "Weed crops" },
        { id: "thin-prune", label: "Thin or prune crops" },
        { id: "irrigate-crops", label: "Irrigate crops" },
        { id: "fertilize-crops", label: "Apply fertilizer or soil amendments" },
        { id: "monitor-crops", label: "Monitor crops for growth, maturity, pests, disease, or other problems" },
        { id: "hand-harvest", label: "Harvest crops by hand" },
        { id: "grade-sort", label: "Grade or sort crops" },
        { id: "pack-crops", label: "Clean, pack, or prepare crops for storage or shipment" },
        { id: "move-crops-materials", label: "Load, unload, or move crops, plants, containers, or farm materials" },
        { id: "post-harvest", label: "Perform post-harvest handling or storage activities" },
        { id: "nursery-greenhouse", label: "Perform nursery or greenhouse production work" },
        { id: "crop-records", label: "Maintain crop or production records" }
      ]
    },

    livestock: {
      label: "Livestock Work",
      icon: "icons/livestock.svg",
      duties: [
        { id: "feed-water-livestock", label: "Feed and water livestock" },
        { id: "mix-distribute-feed", label: "Mix or distribute feed, supplements, or medications" },
        { id: "monitor-livestock-health", label: "Monitor livestock health and physical condition" },
        { id: "livestock-treatment", label: "Administer routine medications, vaccinations, or treatments" },
        { id: "herd-livestock", label: "Herd, move, segregate, or relocate livestock" },
        { id: "identify-livestock", label: "Brand, tag, mark, or otherwise identify livestock" },
        { id: "clean-animal-housing", label: "Clean and maintain stalls, pens, bedding, and animal housing" },
        { id: "assist-breeding", label: "Assist with breeding or artificial insemination" },
        { id: "assist-births", label: "Assist with calving and provide newborn or postnatal care" },
        { id: "wean-animals", label: "Wean young animals" },
        { id: "routine-animal-care", label: "Groom, clip, shear, castrate, or perform other routine animal-care procedures" },
        { id: "pasture-range", label: "Move livestock between grazing areas or manage animals on pasture or range" },
        { id: "predator-protection", label: "Protect livestock from predators" },
        { id: "livestock-records", label: "Maintain livestock health, treatment, weight, or production records" },
        { id: "transport-livestock", label: "Load, unload, or transport livestock" }
      ]
    },

    maintenance: {
      label: "Maintenance and Repair",
      icon: "icons/maintenance.svg",
      duties: [
        { id: "inspect-maintenance-needs", label: "Inspect equipment, machinery, vehicles, or facilities" },
        { id: "routine-equipment-maintenance", label: "Perform light maintenance as needed on farm gear, equipment, or vehicles" },
        { id: "diagnose-mechanical", label: "Diagnose and report mechanical problems" },
        { id: "repair-farm-vehicles", label: "Make advanced repairs to farm equipment or vehicles" },
        { id: "repair-irrigation", label: "Maintain or repair irrigation, plumbing, or sprinkler systems" },
        { id: "repair-facilities", label: "Maintain or repair agricultural buildings, pens, yards, or other structures" },
        { id: "repair-fences", label: "Repair existing fences or gates" },
        {
          id: "build-fences",
          label: "Build or install new fences or gates",
          riskTags: ["occupation-review", "fence-construction"]
        },
        { id: "welding-fabrication", label: "Perform welding or metal fabrication" },
        { id: "electrical-repair", label: "Repair or replace electrical components or wiring" },
        { id: "engine-repair", label: "Perform engine repair or overhaul" },
      ]
    },

    chemical: {
      label: "Pesticide Handling, Spraying, and Application",
      icon: "icons/chemical.svg",
      duties: [
        { id: "mix-chemicals", label: "Mix or prepare pesticides, herbicides, fungicides, or other agricultural chemicals" },
        { id: "load-application-equipment", label: "Fill or load chemical application equipment" },
        { id: "setup-application-equipment", label: "Set up hoses, nozzles, pumps, sprayers, or other application equipment" },
        { id: "apply-chemicals", label: "Apply pesticides, herbicides, fungicides, or other agricultural chemicals" },
        { id: "mechanized-application", label: "Operate vehicle-mounted or mechanized application equipment" },
        { id: "hand-spraying", label: "Perform hand or backpack spraying" },
        { id: "monitor-application-conditions", label: "Monitor weather, terrain, application rates, or other application conditions" },
        { id: "identify-treatment-needs", label: "Identify pests, weeds, diseases, or treatment needs" },
        { id: "service-application-equipment", label: "Clean, inspect, or service pesticide application equipment" },
        { id: "application-records", label: "Maintain pesticide application records" },
        { id: "precision-application", label: "Use GPS, drones, or precision-application technology" }
      ]
    },

    supervision: {
      label: "Supervision",
      icon: "icons/supervisor.svg",
      duties: [
        { id: "assign-work", label: "Assign work and direct workers" },
        { id: "schedule-crews", label: "Plan or schedule crews and daily work" },
        { id: "train-workers", label: "Train workers in job duties, equipment use, or work procedures" },
        { id: "monitor-performance", label: "Monitor worker performance and work quality" },
        { id: "enforce-safety", label: "Monitor and enforce workplace safety requirements" },
        { id: "inspect-work-needs", label: "Inspect crops, livestock, fields, facilities, or equipment to determine work needs" },
        { id: "coordinate-resources", label: "Coordinate workers, equipment, supplies, or transportation between locations" },
        { id: "oversee-production", label: "Coordinate or oversee production activities" },
        { id: "resolve-operational-problems", label: "Identify and resolve operational problems" },
        { id: "communicate-management", label: "Communicate with managers about production needs, schedules, or conditions" },
        { id: "supervisory-records", label: "Maintain time, payroll, personnel, production, or other supervisory records" },
        { id: "coordinate-supplies", label: "Requisition or coordinate needed equipment and supplies" }
      ]
    },

    trucking: {
      label: "Trucking",
      icon: "icons/trucking.svg",
      duties: [
        { id: "inspect-truck", label: "Inspect trucks, trailers, and safety equipment before operation" },
        { id: "drive-heavy-trucks", label: "Drive heavy commercial vehicles like semi trucks or tractor-trailers" },
        { id: "drive-light-trucks", label: "Drive light vehicles or farm trucks" },
        { id: "transport-crops", label: "Transport crops or agricultural products" },
        { id: "transport-livestock", label: "Transport livestock" },
        { id: "transport-materials", label: "Transport equipment, materials, or supplies" },
        { id: "load-unload-trucks", label: "Load or unload trucks" },
        { id: "secure-cargo", label: "Inspect, position, and secure cargo" },
        { id: "handle-trailers", label: "Couple, uncouple, or position trailers" },
        { id: "follow-routes", label: "Follow routes, delivery instructions, and transportation procedures" },
        { id: "driver-records", label: "Maintain driver, vehicle, cargo, or delivery records" },
        { id: "basic-truck-service", label: "Perform basic vehicle servicing or emergency roadside maintenance" },
        { id: "report-transport-issues", label: "Report mechanical problems, accidents, delays, or other transportation issues" }
      ]
    }
  }
};

console.log("job-config.js loaded:", window.JOB_CONFIG);
