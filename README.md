// ===============================
// FOOTBALL BOOKING (Approach A)
// 7 collections + indexes + seed
// users: email + passHash REQUIRED
// ===============================

// --- reset DB ---
const DB_NAME = "football_booking_app";
var db = db.getSiblingDB(DB_NAME);
db.dropDatabase();

const now = new Date();
const O = ObjectId;
const SLOT_MINUTES = 30;

// ---------- Helpers ----------
function hhmmToMinutes(hhmm){ const [h,m]=hhmm.split(":").map(Number); return h*60+m; }
function buildSlotIndexes(startHHMM, endHHMM, slotMinutes=SLOT_MINUTES){
  const start = hhmmToMinutes(startHHMM);
  const end   = hhmmToMinutes(endHHMM);
  const out = [];
  for (let t = start; t < end; t += slotMinutes) out.push(Math.floor(t/slotMinutes));
  return out;
}

// =====================
// 1) users  (email + passHash bắt buộc)
// =====================
db.createCollection("users", {
  validator: {$jsonSchema:{
    bsonType:"object",
    required:["email","passHash","roles","status","createdAt"],
    properties:{
      name:{bsonType:"string"},
      email:{bsonType:"string", pattern:"^.+@.+\\..+$"},
      phone:{bsonType:"string"},
      // only this is new/required
      passHash:{bsonType:"string"}, // lưu hash (bcrypt) hoặc placeholder
      roles:{bsonType:"array", items:{enum:["customer","owner","admin"]}, minItems:1},
      status:{enum:["active","banned"]},
      createdAt:{bsonType:"date"}, updatedAt:{bsonType:"date"}
    }
  }}
});
db.users.createIndex({ email:1 }, { unique:true }); // unique email
db.users.createIndex({ phone:1 }, { unique:true, sparse:true });
db.users.createIndex({ roles:1 });

// Seed users (8) — tạm để passHash là placeholder
const U = {
  owner1:new O(), owner2:new O(), owner3:new O(),
  cust1:new O(), cust2:new O(), cust3:new O(), cust4:new O(),
  admin:new O(),
};
db.users.insertMany([
  { _id:U.owner1, name:"Minh Pham",  email:"minh.owner1@example.com",  phone:"0900000001", passHash:"__SET_WITH_BCRYPT__", roles:["owner"],    status:"active", createdAt:now },
  { _id:U.owner2, name:"Lan Nguyen", email:"lan.owner2@example.com",   phone:"0900000002", passHash:"__SET_WITH_BCRYPT__", roles:["owner"],    status:"active", createdAt:now },
  { _id:U.owner3, name:"Quang Tran", email:"quang.owner3@example.com", phone:"0900000003", passHash:"__SET_WITH_BCRYPT__", roles:["owner"],    status:"active", createdAt:now },
  { _id:U.cust1,  name:"Anh Le",     email:"anh.cust1@example.com",    phone:"0900001001", passHash:"__SET_WITH_BCRYPT__", roles:["customer"], status:"active", createdAt:now },
  { _id:U.cust2,  name:"Binh Do",    email:"binh.cust2@example.com",   phone:"0900001002", passHash:"__SET_WITH_BCRYPT__", roles:["customer"], status:"active", createdAt:now },
  { _id:U.cust3,  name:"Chi Pham",   email:"chi.cust3@example.com",    phone:"0900001003", passHash:"__SET_WITH_BCRYPT__", roles:["customer"], status:"active", createdAt:now },
  { _id:U.cust4,  name:"Dung Vo",    email:"dung.cust4@example.com",   phone:"0900001004", passHash:"__SET_WITH_BCRYPT__", roles:["customer"], status:"active", createdAt:now },
  { _id:U.admin,  name:"Admin",      email:"admin@example.com",        phone:"0900009999", passHash:"__SET_WITH_BCRYPT__", roles:["admin"],    status:"active", createdAt:now },
]);

// =====================
// 2) venues  (lean: hours.open/close; contact optional)
// =====================
db.createCollection("venues", {
  validator: {$jsonSchema:{
    bsonType:"object",
    required:["ownerId","name","location","status","createdAt","hours"],
    properties:{
      ownerId:{bsonType:"objectId"},
      name:{bsonType:"string"},
      address:{bsonType:"string"},
      area:{bsonType:"string"},
      images:{bsonType:"array", items:{bsonType:"string"}},
      contact:{bsonType:"object", properties:{
        phone:{bsonType:"string"}, email:{bsonType:"string"},
        zalo:{bsonType:"string"}, facebook:{bsonType:"string"}
      }},
      location:{bsonType:"object", required:["type","coordinates"], properties:{
        type:{enum:["Point"]},
        coordinates:{bsonType:"array", items:{bsonType:"double"}, minItems:2, maxItems:2}
      }},
      hours:{bsonType:"object", required:["open","close"], properties:{
        open:{bsonType:"string", pattern:"^\\d{2}:\\d{2}$"},
        close:{bsonType:"string", pattern:"^\\d{2}:\\d{2}$"}
      }},
      status:{enum:["active","hidden"]},
      ratingAvg:{bsonType:["double","int","long"]},
      ratingCount:{bsonType:["double","int","long"]},
      createdAt:{bsonType:"date"}, updatedAt:{bsonType:"date"}
    }
  }}
});
db.venues.createIndex({ location: "2dsphere" });
db.venues.createIndex({ name: "text", address: "text", area: "text" });

const V = { v1:new O(), v2:new O(), v3:new O(), v4:new O(), v5:new O(), v6:new O(), v7:new O(), v8:new O() };
db.venues.insertMany([
  { _id:V.v1, ownerId:U.owner1, name:"Sân Q7 Riverside 5v5", address:"Nguyễn Lương Bằng, Quận 7, TP.HCM", area:"Q7, HCMC", images:["https://img.example.com/v1-1.jpg","https://img.example.com/v1-2.jpg"], contact:{ phone:"0907000001" }, location:{ type:"Point", coordinates:[106.721, 10.738] }, hours:{ open:"06:00", close:"23:00" }, status:"active", ratingAvg:4.6, ratingCount:34, createdAt:now },
  { _id:V.v2, ownerId:U.owner1, name:"Sân Linh Trung 7v7",    address:"Linh Trung, TP.Thủ Đức, TP.HCM", area:"Thu Duc, HCMC", images:["https://img.example.com/v2-1.jpg"], contact:{ phone:"0907000002" }, location:{ type:"Point", coordinates:[106.789, 10.870] }, hours:{ open:"06:00", close:"23:00" }, status:"active", ratingAvg:4.2, ratingCount:18, createdAt:now },
  { _id:V.v3, ownerId:U.owner1, name:"Sân Gò Vấp Mini",       address:"Phan Văn Trị, Gò Vấp, TP.HCM",   area:"Go Vap, HCMC", images:["https://img.example.com/v3-1.jpg"],  contact:{ phone:"0907000003" }, location:{ type:"Point", coordinates:[106.680, 10.840] }, hours:{ open:"08:00", close:"22:00" }, status:"active", ratingAvg:4.5, ratingCount:12, createdAt:now },
  { _id:V.v4, ownerId:U.owner2, name:"Sân Cầu Giấy 7v7",      address:"Cầu Giấy, Hà Nội",               area:"Cau Giay, Ha Noi", images:["https://img.example.com/v4-1.jpg"], contact:{ phone:"0912000001" }, location:{ type:"Point", coordinates:[105.790, 21.036] }, hours:{ open:"07:00", close:"22:00" }, status:"active", ratingAvg:4.1, ratingCount:9, createdAt:now },
  { _id:V.v5, ownerId:U.owner2, name:"Sân Hoàng Mai 11v11",   address:"Hoàng Mai, Hà Nội",              area:"Hoang Mai, Ha Noi", images:["https://img.example.com/v5-1.jpg"], contact:{ phone:"0912000002" }, location:{ type:"Point", coordinates:[105.865, 20.975] }, hours:{ open:"06:00", close:"23:00" }, status:"active", ratingAvg:4.0, ratingCount:6, createdAt:now },
  { _id:V.v6, ownerId:U.owner2, name:"Sân Đà Nẵng Hải Châu",  address:"Hải Châu, Đà Nẵng",              area:"Hai Chau, Da Nang", images:["https://img.example.com/v6-1.jpg"], contact:{ phone:"0905550001" }, location:{ type:"Point", coordinates:[108.210, 16.060] }, hours:{ open:"06:00", close:"23:00" }, status:"active", ratingAvg:4.3, ratingCount:11, createdAt:now },
  { _id:V.v7, ownerId:U.owner3, name:"Sân Cần Thơ Ninh Kiều", address:"Ninh Kiều, Cần Thơ",             area:"Ninh Kieu, Can Tho", images:["https://img.example.com/v7-1.jpg"], contact:{ phone:"0908000001" }, location:{ type:"Point", coordinates:[105.784, 10.034] }, hours:{ open:"06:30", close:"22:30" }, status:"active", ratingAvg:4.7, ratingCount:21, createdAt:now },
  { _id:V.v8, ownerId:U.owner3, name:"Sân Thủ Dầu Một 5v5",   address:"Thủ Dầu Một, Bình Dương",        area:"Thu Dau Mot, Binh Duong", images:["https://img.example.com/v8-1.jpg"], contact:{ phone:"0908000002" }, location:{ type:"Point", coordinates:[106.652, 10.980] }, hours:{ open:"06:00", close:"23:00" }, status:"active", ratingAvg:4.2, ratingCount:7, createdAt:now },
]);

// =====================
// 3) sub_pitches  (bookableBlocks + blockPrices)
// =====================
db.createCollection("sub_pitches", {
  validator: {$jsonSchema:{
    bsonType:"object",
    required:["venueId","name","type","active","createdAt"],
    properties:{
      venueId:{bsonType:"objectId"},
      name:{bsonType:"string"},
      type:{enum:["5v5","7v7","9v9","11v11"]},
      active:{bsonType:"bool"},
      bookableBlocks:{bsonType:"array",
        items:{bsonType:"object", required:["start","end"],
          properties:{
            start:{bsonType:"string", pattern:"^\\d{2}:\\d{2}$"},
            end:{bsonType:"string", pattern:"^\\d{2}:\\d{2}$"},
            label:{bsonType:"string"}
          }
        }
      },
      blockPrices:{bsonType:"object", additionalProperties:{bsonType:["double","int","long"]}},
      createdAt:{bsonType:"date"}, updatedAt:{bsonType:"date"}
    }
  }}
});
db.sub_pitches.createIndex({venueId:1, active:1});
db.sub_pitches.createIndex({type:1});

const SP = { sp1:new O(), sp2:new O(), sp3:new O(), sp4:new O(), sp5:new O(), sp6:new O(), sp7:new O(), sp8:new O() };
db.sub_pitches.insertMany([
  { _id:SP.sp1, venueId:V.v1, name:"Sân 1", type:"5v5", active:true,
    bookableBlocks:[ { start:"13:00", end:"15:00", label:"13-15" }, { start:"15:00", end:"17:00", label:"15-17" }, { start:"17:00", end:"19:00", label:"17-19" } ],
    blockPrices:{ "13:00-15:00": 400000, "15:00-17:00": 400000, "17:00-19:00": 450000 },
    createdAt:now },
  { _id:SP.sp2, venueId:V.v2, name:"Sân 1", type:"7v7", active:true,
    bookableBlocks:[ { start:"07:00", end:"09:00", label:"7-9" }, { start:"17:00", end:"19:00", label:"17-19" }, { start:"19:00", end:"21:00", label:"19-21" } ],
    blockPrices:{ "07:00-09:00": 500000, "17:00-19:00": 600000, "19:00-21:00": 650000 },
    createdAt:now },
  { _id:SP.sp3, venueId:V.v3, name:"Sân 1", type:"5v5", active:true,
    bookableBlocks:[ { start:"18:00", end:"20:00", label:"18-20" }, { start:"20:00", end:"22:00", label:"20-22" } ],
    blockPrices:{ "18:00-20:00": 440000, "20:00-22:00": 440000 },
    createdAt:now },
  { _id:SP.sp4, venueId:V.v4, name:"Sân 1", type:"7v7", active:true,
    bookableBlocks:[ { start:"16:00", end:"18:00", label:"16-18" }, { start:"18:00", end:"20:00", label:"18-20" } ],
    blockPrices:{ "16:00-18:00": 640000, "18:00-20:00": 640000 },
    createdAt:now },
  { _id:SP.sp5, venueId:V.v5, name:"Sân 1", type:"11v11", active:true,
    bookableBlocks:[ { start:"06:00", end:"08:00", label:"6-8" }, { start:"15:00", end:"17:00", label:"15-17" }, { start:"19:00", end:"21:00", label:"19-21" } ],
    blockPrices:{ "06:00-08:00": 900000, "15:00-17:00": 1000000, "19:00-21:00": 1100000 },
    createdAt:now },
  { _id:SP.sp6, venueId:V.v6, name:"Sân 1", type:"5v5", active:true,
    bookableBlocks:[ { start:"17:00", end:"19:00", label:"17-19" }, { start:"19:00", end:"21:00", label:"19-21" } ],
    blockPrices:{ "17:00-19:00": 460000, "19:00-21:00": 480000 },
    createdAt:now },
  { _id:SP.sp7, venueId:V.v7, name:"Sân 1", type:"7v7", active:true,
    bookableBlocks:[ { start:"18:00", end:"20:00", label:"18-20" }, { start:"20:00", end:"22:00", label:"20-22" } ],
    blockPrices:{ "18:00-20:00": 620000, "20:00-22:00": 640000 },
    createdAt:now },
  { _id:SP.sp8, venueId:V.v8, name:"Sân 1", type:"5v5", active:true,
    bookableBlocks:[ { start:"07:00", end:"09:00", label:"7-9" }, { start:"17:00", end:"19:00", label:"17-19" } ],
    blockPrices:{ "07:00-09:00": 420000, "17:00-19:00": 450000 },
    createdAt:now },
]);

// =====================
// 4) bookings
// =====================
db.createCollection("bookings", {
  validator: {$jsonSchema:{
    bsonType:"object",
    required:["userId","subPitchId","date","startTime","endTime","status","paymentOption","totalAmount","currency","createdAt"],
    properties:{
      userId:{bsonType:"objectId"},
      subPitchId:{bsonType:"objectId"},
      date:{bsonType:"string", pattern:"^\\d{4}-\\d{2}-\\d{2}$"},
      startTime:{bsonType:"string", pattern:"^\\d{2}:\\d{2}$"},
      endTime:{bsonType:"string", pattern:"^\\d{2}:\\d{2}$"},
      status:{enum:["pending_payment","confirmed","cancelled","completed","refunded","no_show"]},
      paymentOption:{enum:["full_online","deposit_online","pay_on_site"]},
      depositPercent:{bsonType:["double","int","long"], minimum:0, maximum:1},
      totalAmount:{bsonType:["double","int","long"], minimum:0},
      currency:{bsonType:"string"},
      qrToken:{bsonType:"string"},
      paymentDeadlineAt:{bsonType:"date"},
      notes:{bsonType:"string"},
      createdAt:{bsonType:"date"}, updatedAt:{bsonType:"date"}
    }
  }}
});
db.bookings.createIndex({ userId:1, createdAt:-1 });
db.bookings.createIndex({ subPitchId:1, date:1 });
db.bookings.createIndex({ status:1, paymentDeadlineAt:1 });

const B = { b1:new O(), b2:new O(), b3:new O(), b4:new O(), b5:new O(), b6:new O(), b7:new O(), b8:new O() };
db.bookings.insertMany([
  { _id:B.b1, userId:U.cust1, subPitchId:SP.sp1, date:"2025-11-01", startTime:"13:00", endTime:"15:00", status:"confirmed", paymentOption:"deposit_online", depositPercent:0.3, totalAmount:400000, currency:"VND", qrToken:"QR-"+B.b1.valueOf(), paymentDeadlineAt:new Date(now.getTime()+15*60*1000), createdAt:now },
  { _id:B.b2, userId:U.cust2, subPitchId:SP.sp2, date:"2025-11-01", startTime:"17:00", endTime:"19:00", status:"confirmed", paymentOption:"full_online", totalAmount:600000, currency:"VND", qrToken:"QR-"+B.b2.valueOf(), paymentDeadlineAt:new Date(now.getTime()+15*60*1000), createdAt:now },
  { _id:B.b3, userId:U.cust3, subPitchId:SP.sp3, date:"2025-10-15", startTime:"19:00", endTime:"21:00", status:"completed", paymentOption:"full_online", totalAmount:440000, currency:"VND", qrToken:"QR-"+B.b3.valueOf(), createdAt:new Date("2025-10-10T10:00:00Z") },
  { _id:B.b4, userId:U.cust4, subPitchId:SP.sp4, date:"2025-10-20", startTime:"18:00", endTime:"20:00", status:"completed", paymentOption:"deposit_online", depositPercent:0.3, totalAmount:640000, currency:"VND", qrToken:"QR-"+B.b4.valueOf(), createdAt:new Date("2025-10-15T10:00:00Z") },
  { _id:B.b5, userId:U.cust1, subPitchId:SP.sp5, date:"2025-11-02", startTime:"15:00", endTime:"17:00", status:"pending_payment", paymentOption:"deposit_online", depositPercent:0.3, totalAmount:1000000, currency:"VND", paymentDeadlineAt:new Date(now.getTime()+15*60*1000), qrToken:"QR-"+B.b5.valueOf(), createdAt:now },
  { _id:B.b6, userId:U.cust2, subPitchId:SP.sp6, date:"2025-10-10", startTime:"17:00", endTime:"19:00", status:"cancelled", paymentOption:"pay_on_site", totalAmount:460000, currency:"VND", qrToken:"QR-"+B.b6.valueOf(), createdAt:new Date("2025-10-05T08:00:00Z") },
  { _id:B.b7, userId:U.cust3, subPitchId:SP.sp7, date:"2025-10-05", startTime:"20:00", endTime:"22:00", status:"completed", paymentOption:"full_online", totalAmount:620000, currency:"VND", qrToken:"QR-"+B.b7.valueOf(), createdAt:new Date("2025-10-01T08:00:00Z") },
  { _id:B.b8, userId:U.cust4, subPitchId:SP.sp8, date:"2025-10-12", startTime:"07:00", endTime:"09:00", status:"completed", paymentOption:"full_online", totalAmount:420000, currency:"VND", qrToken:"QR-"+B.b8.valueOf(), createdAt:new Date("2025-10-08T08:00:00Z") },
]);

// =====================
// 5) slot_reservations (30' slot; TTL cho hold)
// =====================
db.createCollection("slot_reservations", {
  validator: {$jsonSchema:{
    bsonType:"object",
    required:["subPitchId","date","slotIndex","status","createdAt"],
    properties:{
      subPitchId:{bsonType:"objectId"},
      date:{bsonType:"string", pattern:"^\\d{4}-\\d{2}-\\d{2}$"},
      slotIndex:{bsonType:["int","long","double"], minimum:0},
      status:{enum:["hold","booked"]},
      bookingId:{bsonType:"objectId"},
      expiresAt:{bsonType:"date"},
      createdAt:{bsonType:"date"}
    }
  }}
});
db.slot_reservations.createIndex({ subPitchId:1, date:1, slotIndex:1 }, { unique:true, name:"uniq_slot" });
db.slot_reservations.createIndex({ expiresAt:1 }, { expireAfterSeconds:0 });

// Seed
const sr = [];
buildSlotIndexes("13:00","15:00").forEach(idx => {
  sr.push({ subPitchId:SP.sp1, date:"2025-11-01", slotIndex:idx, status:"booked", bookingId:B.b1, createdAt:now });
});
buildSlotIndexes("17:00","19:00").forEach(idx => {
  sr.push({ subPitchId:SP.sp2, date:"2025-11-01", slotIndex:idx, status:"booked", bookingId:B.b2, createdAt:now });
});
sr.push({
  subPitchId:SP.sp1, date:"2025-11-01",
  slotIndex: buildSlotIndexes("15:00","15:30")[0],
  status:"hold", bookingId:B.b5, createdAt:now, expiresAt: new Date(Date.now() + 10*60*1000)
});
db.slot_reservations.insertMany(sr);

// =====================
// 6) payments
// =====================
db.createCollection("payments", {
  validator: {$jsonSchema:{
    bsonType:"object",
    required:["bookingId","method","amount","currency","status","createdAt"],
    properties:{
      bookingId:{bsonType:"objectId"},
      method:{enum:["vnpay","momo","cash","other"]},
      gatewayTxnId:{bsonType:"string"},
      amount:{bsonType:["double","int","long"], minimum:0},
      currency:{bsonType:"string"},
      status:{enum:["initiated","paid","failed","refunded","chargeback"]},
      createdAt:{bsonType:"date"}, updatedAt:{bsonType:"date"}
    }
  }}
});
db.payments.createIndex({ bookingId:1 });
db.payments.createIndex({ gatewayTxnId:1 }, { unique:true, sparse:true });

db.payments.insertMany([
  { bookingId:B.b1, method:"momo",  gatewayTxnId:"TXN-b1-001", amount:120000, currency:"VND", status:"paid",     createdAt:now },
  { bookingId:B.b1, method:"momo",  gatewayTxnId:"TXN-b1-002", amount:280000, currency:"VND", status:"paid",     createdAt:now },
  { bookingId:B.b2, method:"vnpay", gatewayTxnId:"TXN-b2-001", amount:600000, currency:"VND", status:"paid",     createdAt:now },
  { bookingId:B.b3, method:"vnpay", gatewayTxnId:"TXN-b3-001", amount:440000, currency:"VND", status:"paid",     createdAt:new Date("2025-10-10T11:00:00Z") },
  { bookingId:B.b4, method:"momo",  gatewayTxnId:"TXN-b4-001", amount:192000, currency:"VND", status:"paid",     createdAt:new Date("2025-10-15T11:00:00Z") },
  { bookingId:B.b4, method:"momo",  gatewayTxnId:"TXN-b4-002", amount:448000, currency:"VND", status:"paid",     createdAt:new Date("2025-10-19T11:00:00Z") },
  { bookingId:B.b6, method:"cash",  gatewayTxnId:"TXN-b6-001", amount:460000, currency:"VND", status:"refunded", createdAt:new Date("2025-10-06T09:00:00Z") },
  { bookingId:B.b8, method:"vnpay", gatewayTxnId:"TXN-b8-001", amount:420000, currency:"VND", status:"paid",     createdAt:new Date("2025-10-08T09:00:00Z") },
]);

// =====================
// 7) reviews  (per subPitch)
// =====================
db.createCollection("reviews", {
  validator: {$jsonSchema:{
    bsonType:"object",
    required:["bookingId","subPitchId","userId","rating","createdAt"],
    properties:{
      bookingId:{bsonType:"objectId"},
      subPitchId:{bsonType:"objectId"},
      userId:{bsonType:"objectId"},
      rating:{bsonType:["double","int","long"], minimum:1, maximum:5},
      comment:{bsonType:"string"},
      createdAt:{bsonType:"date"}
    }
  }}
});
db.reviews.createIndex({ bookingId:1 }, { unique:true });

db.reviews.insertMany([
  { bookingId:B.b3, subPitchId:SP.sp3, userId:U.cust3, rating:5, comment:"Sân đẹp, đèn sáng.", createdAt:new Date("2025-10-16T12:00:00Z") },
  { bookingId:B.b4, subPitchId:SP.sp4, userId:U.cust4, rating:4, comment:"Chỗ đậu xe rộng.",    createdAt:new Date("2025-10-21T12:00:00Z") },
  { bookingId:B.b7, subPitchId:SP.sp7, userId:U.cust3, rating:5, comment:"Quản lý nhiệt tình.", createdAt:new Date("2025-10-06T12:00:00Z") },
  { bookingId:B.b8, subPitchId:SP.sp8, userId:U.cust4, rating:4, comment:"Mặt cỏ ổn định.",     createdAt:new Date("2025-10-12T12:00:00Z") },
  { bookingId:B.b1, subPitchId:SP.sp1, userId:U.cust1, rating:5, comment:"Đặt nhanh, giá hợp lý.", createdAt:now },
  { bookingId:B.b2, subPitchId:SP.sp2, userId:U.cust2, rating:5, comment:"Chủ sân hỗ trợ tốt.",   createdAt:now },
  { bookingId:B.b6, subPitchId:SP.sp6, userId:U.cust2, rating:3, comment:"Hủy do thời tiết.",    createdAt:new Date("2025-10-10T20:00:00Z") },
]);

// Done 🎉
