const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express"); // Importing express module
const cors = require("cors");

const app = express(); // Creating an express object
app.use(express.json());
app.use(cors());

const port = 8000; // Setting an port for this application

app.get("/", function (req, res) {
  res.send("we are at the root route of our server");
});

app.post("/user/signup", async (req, res) => {
  console.log(req);
  const userData = req.body.userData;
  const createUser = await prisma.user.create({
    data: userData,
  });
  res.json({ data: createUser });
});

app.post("/user/login", async (req, res) => {
  const userData = req.body.userData;
  const authUser = await prisma.user.findFirst({
    where: {
      type: "user",
      emailid: userData.emailid,
      password: userData.password,
    },
  });
  if (authUser && authUser.id) {
    res.json({ data: authUser, status: 1 });
  } else {
    res.json({ status: 0 });
  }
});

app.post("/admin/login", async (req, res) => {
  const adminData = req.body.adminData;
  console.log(adminData);
  const authAdmin = await prisma.user.findFirst({
    where: {
      type: "admin",
      id: adminData.adminId,
      password: adminData.password,
    },
  });
  if (authAdmin && authAdmin.id) {
    res.json({ data: authAdmin, status: 1 });
  } else {
    res.json({ status: 0 });
  }
});

app.post("/admin/addCentre", async (req, res) => {
  console.log(req);
  const centreData = req.body.centreData;
  const createCentre = await prisma.centres.create({
    data: centreData,
  });
  res.json({ data: createCentre });
});

app.get("/admin/getCentres", async (req, res) => {
  const centres = await prisma.centres.findMany({});
  res.json({ data: centres });
});

app.post("/admin/deleteCentre", async (req, res) => {
  const centreId = req.body.centreData;
  const deleteCentre = await prisma.centres.delete({
    where: {
      centre_id: centreId,
    },
  });
  res.json({ data: deleteCentre });
});

app.post("/admin/getCentreDetails", async (req, res) => {
  const centreId = req.body.centreData;
  const result = {};
  const centreDetails = await prisma.centres.findUnique({
    where: {
      centre_id: centreId,
    },
  });
  result.centreDetails = centreDetails;

  const dosageDetails = await prisma.dosage.groupBy({
    by: ["date"],
    _count: true,
    where: {
      centre_id: centreId,
    },
  });
  result.dosageDetails = dosageDetails;
  res.json({ data: result });
});

app.post("/user/getProfile", async (req, res) => {
  const profile = await prisma.user.findFirst({
    where: {
      id: req.body.userId,
    },
  });
  res.json({ data: profile });
});

app.post("/user/bookSlot", async (req, res) => {
  const bookingData = req.body.bookingData;

  const numSlots = await prisma.dosage.count({
    where: {
      centre_id: bookingData.centreId,
      date: new Date(bookingData.date),
    },
  });

  const maxSlots = await prisma.centres.findUnique({
    where: {
      centre_id: bookingData.centreId,
    },
  });

  if (numSlots < maxSlots.slots) {
    const booking = await prisma.dosage.create({
      data: {
        user_id: req.body.userId,
        centre_id: bookingData.centreId,
        date: new Date(bookingData.date),
      },
    });
    res.json({ data: booking, status: 1 });
  } else {
    res.json({
      status: 0,
      message: "Sorry! There are no slots available on this date.",
    });
  }
});

// Starting server using listen function
app.listen(port, function (err) {
  if (err) {
    console.log("Error while starting server");
  } else {
    console.log("Server has been started at " + port);
  }
});

module.exports = app;
