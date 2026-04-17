import { prisma } from "./prisma"

const ticketData = [
  {
    ticketNumber: "CPJSW4",
    securityHash:
      "1a50a19807ed468308aac377e193811f42d763b17b23ad31b082e2ac51fd6428",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "BLXSB9",
    securityHash:
      "4a1ab2536ccf272f4dfd876e10ad3e7d18cc76b0aabd04a121026eba58c90d9d",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "VNXBCS",
    securityHash:
      "72ecaa39edce4833992d6bb4ce4c6873b3e57f2ed696865943bd92bb7bb5ee1e",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "ECP6AT",
    securityHash:
      "fb25b3d29d2a526377d76856277604692fc0b5b67a3889b55ffb289e6632c3b1",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "K2AFNQ",
    securityHash:
      "dee5923ac73d2a895e7408d3c76aed82565984a5810a3d7a110dd4b369f412df",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "JVTR2Y",
    securityHash:
      "923ded56a174ba635effc686cc579d4f182ade48b08b801995c67e32b1f5ba72",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "2H27TM",
    securityHash:
      "c6d8abcfe3017fa18bc060d399337c32748174a1aef029e9b76fbf3525d50380",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "V7FPC1",
    securityHash:
      "2356bf70650f979a296e3a052bcfcade497cc695636c281135e93bec11480e93",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "YQNO9L",
    securityHash:
      "0474a7a883a04c1b245e629b641b6e3b5916da568ebeda69e673a3e136ace3d4",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "4EIMFV",
    securityHash:
      "d4a34b2f28d5005feeb91c6c1827cbbbb65ef83a09a15a4ae431497a7bc57e0c",
    isUsed: false,
    status: "AVAILABLE",
  },
  {
    ticketNumber: "HAHLU8",
    securityHash:
      "f82deb7d5710d49af247494552676695c4e91273b7022aa12cff5452c98a07d0",
    isUsed: false,
    status: "AVAILABLE",
  },
]

async function main() {
  console.log("Seeding tickets...")

  for (const ticket of ticketData) {
    await prisma.ticket.upsert({
      where: { ticketNumber: ticket.ticketNumber },
      update: {
        securityHash: ticket.securityHash,
        isUsed: ticket.isUsed,
      },
      create: {
        ticketNumber: ticket.ticketNumber,
        securityHash: ticket.securityHash,
        isUsed: ticket.isUsed,
      },
    })
  }

  console.log(`Seeded ${ticketData.length} tickets`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
