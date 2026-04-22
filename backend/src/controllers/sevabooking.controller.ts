import { Request, Response } from "express";
import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";


/**
 * GET ALL SEVA BOOKINGS
 */
export const getSevaBookings = async (req: Request, res: Response) => {

  try {

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [rows] = await db.query<RowDataPacket[]>(

      `SELECT *
       FROM seva_bookings
       WHERE organization_id = ?
       AND temple_id = ?
       AND deleted_at IS NULL
       ORDER BY created_at DESC`,

      [organization_id, temple_id]

    );

    res.json({
      success: true,
      data: rows
    });

  }

  catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/**
 * GET SINGLE BOOKING AND TEMPLE DETAIL ALONG WITH THIS  FOR RECIPT FUNCTION 
 */

// export const getSevaBookingById = async (req: Request, res: Response) => {
//   try {
//     const organization_id = req.user!.organization_id;
//     const temple_id = req.user!.temple_id;
//     const { id } = req.params;

//     const [rows] = await db.query<RowDataPacket[]>(
//       `SELECT 
//         sb.*,

//         t.name AS temple_name,
//         t.email AS temple_email,
//         t.phone AS temple_phone,
//         t.img_name AS temple_logo,

//        CONCAT_WS(', ',
//       t.address_line1,
//       t.address_line2,
//       t.city,
//       t.state,
//       t.country,
//       t.pincode
//     ) AS temple_address

//    FROM seva_bookings sb

//    LEFT JOIN temples t 
//    ON sb.temple_id = t.id

//    WHERE sb.id = ?
//    AND sb.organization_id = ?
//    AND sb.temple_id = ?
//    AND sb.deleted_at IS NULL`,
//   [id, organization_id, temple_id]
// );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: rows[0],
//     });

//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getSevaBookingById = async (req: Request, res: Response) => {
  try {
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const { id } = req.params;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        sb.*,

        t.name AS temple_name,
        t.email AS temple_email,
        t.phone AS temple_phone,
        t.img_name AS temple_logo,

        CONCAT_WS(', ',
          t.address_line1,
          t.address_line2,
          t.city,
          t.state,
          t.country,
          t.pincode
        ) AS temple_address,

        d.name AS deity_name,
        d.img_name AS deity_image,
        d.code AS deity_code,
        d.description AS deity_description

      FROM seva_bookings sb

      LEFT JOIN temples t 
        ON sb.temple_id = t.id

      LEFT JOIN deities d 
        ON sb.deity_id = d.id

      WHERE sb.id = ?
        AND sb.organization_id = ?
        AND sb.temple_id = ?
        AND sb.deleted_at IS NULL`,
      [id, organization_id, temple_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const createSevaBooking = async (req: Request, res: Response) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const created_by_user_id = req.user!.id;

    const {
      seva_id,
      deity_id,

      devotee_id,
      devotee_name,
      devotee_phone,
      devotee_email,
      devotee_gotra,
      devotee_rashi,
      devotee_nakshatra,
      devotee_dob,
      devotee_gender,

      seva_name,
      seva_amount,
      quantity = 1,

      scheduled_date,
      scheduled_time,

      is_recurring = "no",
      recurring_interval,
      recurring_count,

      payment_method_id,
      paid_amount = 0,

      remark,
      internal_note,
      hindu_paksha,
      hindu_tithi,
      hindu_month,
      hindu_samvat,
      hindu_shaka_year,
      hindu_nakshatra
    } = req.body;

    if (!seva_name || !seva_amount || !scheduled_date) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // =====================================================
    // 1 DEVOTEE CHECK / UPDATE / CREATE
    // =====================================================

    let finalDevoteeId = devotee_id;

    // 🔹 CASE 1: Devotee ID exists → check & update if changed
    if (finalDevoteeId) {

      const [rows]: any = await connection.query(
        `SELECT * FROM devotees
         WHERE id=? AND temple_id=? AND organization_id=?`,
        [finalDevoteeId, temple_id, organization_id]
      );

      if (rows.length > 0) {

        const oldData = rows[0];

        const isChanged =
          oldData.name !== devotee_name ||
          oldData.phone !== devotee_phone ||
          oldData.email !== devotee_email ||
          oldData.gotra !== devotee_gotra ||
          oldData.rashi !== devotee_rashi ||
          oldData.nakshatra !== devotee_nakshatra ||
          String(oldData.dob || "") !== String(devotee_dob || "") ||
          oldData.gender !== devotee_gender;

        if (isChanged) {

          await connection.query(
            `UPDATE devotees SET
              name=?,
              phone=?,
              email=?,
              gotra=?,
              rashi=?,
              nakshatra=?,
              dob=?,
              gender=?,
              updated_at=NOW()
             WHERE id=? AND temple_id=? AND organization_id=?`,
            [
              devotee_name,
              devotee_phone,
              devotee_email,
              devotee_gotra,
              devotee_rashi,
              devotee_nakshatra,
              devotee_dob,
              devotee_gender,
              finalDevoteeId,
              temple_id,
              organization_id
            ]
          );

          const newData = {
            ...oldData,
            name: devotee_name,
            phone: devotee_phone,
            email: devotee_email,
            gotra: devotee_gotra,
            rashi: devotee_rashi,
            nakshatra: devotee_nakshatra,
            dob: devotee_dob,
            gender: devotee_gender
          };

          await connection.query(
            `INSERT INTO audit_logs
             (actor_user_id, organization_id, temple_id,
              table_name, record_id, action,
              old_data, new_data, created_at)
             VALUES (?, ?, ?, 'devotees', ?, 'update', ?, ?, NOW())`,
            [
              created_by_user_id,
              organization_id,
              temple_id,
              finalDevoteeId,
              JSON.stringify(oldData),
              JSON.stringify(newData)
            ]
          );
        }
      }
    }

    //  CASE 2: No Devotee ID → find or create
    if (!finalDevoteeId && devotee_name && (devotee_phone || devotee_email)) {

      const [existing]: any = await connection.query(
        `SELECT * FROM devotees
         WHERE temple_id=? AND organization_id=?
         AND (phone=? OR email=?)
         LIMIT 1`,
        [temple_id, organization_id, devotee_phone, devotee_email]
      );

      if (existing.length > 0) {

        finalDevoteeId = existing[0].id;

      } else {

        const [newDevotee] = await connection.query<ResultSetHeader>(
          `INSERT INTO devotees
           (organization_id, temple_id, name, phone, email,
            gotra, rashi, nakshatra, dob, gender, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            organization_id,
            temple_id,
            devotee_name,
            devotee_phone,
            devotee_email,
            devotee_gotra,
            devotee_rashi,
            devotee_nakshatra,
            devotee_dob,
            devotee_gender
          ]
        );

        finalDevoteeId = newDevotee.insertId;

        const newData = {
          id: finalDevoteeId,
          name: devotee_name,
          phone: devotee_phone,
          email: devotee_email,
          gotra: devotee_gotra,
          rashi: devotee_rashi,
          nakshatra: devotee_nakshatra,
          dob: devotee_dob,
          gender: devotee_gender
        };

        await connection.query(
          `INSERT INTO audit_logs
           (actor_user_id, organization_id, temple_id,
            table_name, record_id, action,
            old_data, new_data, created_at)
           VALUES (?, ?, ?, 'devotees', ?, 'insert', ?, ?, NOW())`,
          [
            created_by_user_id,
            organization_id,
            temple_id,
            finalDevoteeId,
            null,
            JSON.stringify(newData)
          ]
        );
      }
    }

    // =====================================================
    // 2 CALCULATE TOTAL
    // =====================================================

    const total_amount = Number(seva_amount) * Number(quantity);

    const payment_status =
      paid_amount >= total_amount
        ? "paid"
        : paid_amount > 0
        ? "partial"
        : "pending";

    const receipt_number = `RCPT-${Date.now()}`;

    // =====================================================
    // 3️⃣ INSERT SEVA BOOKING
    // =====================================================

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO seva_bookings (
        organization_id, temple_id, seva_id, deity_id, devotee_id,
        devotee_name, devotee_phone, devotee_email, devotee_gotra,
        devotee_rashi, devotee_nakshatra, devotee_dob, devotee_gender,
        seva_name, seva_amount, quantity, total_amount,
        scheduled_date, scheduled_time,
        is_recurring, recurring_interval, recurring_count,
        payment_method_id, paid_amount, payment_status,
        receipt_number, remark, internal_note,
        status, created_by_user_id,
        hindu_paksha,
      hindu_tithi,
      hindu_month,
      hindu_samvat,
      hindu_shaka_year,
      hindu_nakshatra,
       created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'booked', ?,?,?,?,?,?,?, NOW())`,
      [
        organization_id,
        temple_id,
        seva_id,
        deity_id,
        finalDevoteeId,
        devotee_name,
        devotee_phone,
        devotee_email,
        devotee_gotra,
        devotee_rashi,
        devotee_nakshatra,
        devotee_dob,
        devotee_gender,
        seva_name,
        seva_amount,
        quantity,
        total_amount,
        scheduled_date,
        scheduled_time,
        is_recurring,
        recurring_interval,
        recurring_count,
        payment_method_id,
        paid_amount,
        payment_status,
        receipt_number,
        remark,
        internal_note,
        created_by_user_id,
        hindu_paksha,
        hindu_tithi,
        hindu_month,
        hindu_samvat,
        hindu_shaka_year,
        hindu_nakshatra
      ]
    );

    const bookingId = result.insertId;

    // =====================================================
    // 4 GENERATE OCCURRENCES
    // =====================================================

    const totalOccurrences =
      is_recurring === "yes" && recurring_count
        ? Number(recurring_count)
        : 1;

    let currentDate = new Date(scheduled_date);

    for (let i = 1; i <= totalOccurrences; i++) {

      if (i > 1) {
        if (recurring_interval === "daily") currentDate.setDate(currentDate.getDate() + 1);
        if (recurring_interval === "weekly") currentDate.setDate(currentDate.getDate() + 7);
        if (recurring_interval === "monthly") currentDate.setMonth(currentDate.getMonth() + 1);
        if (recurring_interval === "yearly") currentDate.setFullYear(currentDate.getFullYear() + 1);
      }

      const seva_snapshot = JSON.stringify({
        seva_id,
        seva_name,
        seva_amount,
        quantity
      });

      await connection.query(
        `INSERT INTO seva_occurrences
         (seva_booking_id, occurrence_number, seva_snapshot,
          scheduled_date, scheduled_time,
          status, paid_amount, reminder_sent, remark, created_at)
         VALUES (?, ?, ?, ?, ?, 'scheduled', 0, 0, ?, NOW())`,
        [
          bookingId,
          i,
          seva_snapshot,
          currentDate.toISOString().split("T")[0],
          scheduled_time,
          remark || null
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Seva booked successfully",
      id: bookingId,
      receipt_number
    });

  } catch (error: any) {

    await connection.rollback();

    res.status(500).json({
      success: false,
      message: error.message
    });

  } finally {
    connection.release();
  }
};
/**
 * 
 * UPDATE BOOKING
 */


export const updateSevaBooking = async (req: Request, res: Response) => {

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const updated_by_user_id = req.user!.id;

    const { id } = req.params;

    const {
      seva_id,
      deity_id,
      devotee_id,
      devotee_name,
      devotee_phone,
      devotee_email,
      devotee_gotra,
      devotee_rashi,
      devotee_nakshatra,
      devotee_dob,
      devotee_gender,
      seva_name,
      seva_amount,
      quantity,
      calendar_type,
      scheduled_date,
      scheduled_time,
      payment_method_id,
      paid_amount,
      payment_status,
      status,
      remark,
      internal_note,
      recurring_interval,
      is_recurring
    } = req.body;

    const total_amount = Number(seva_amount) * Number(quantity);

    // =====================================
    // 1 Fetch old record snapshot
    // =====================================
    const [oldRows]: any = await connection.query(
      `SELECT * FROM seva_bookings
       WHERE id=? AND organization_id=? AND temple_id=?`,
      [id, organization_id, temple_id]
    );

    if (!oldRows.length) {
      return res.status(404).json({
        success: false,
        message: "Seva booking not found"
      });
    }

    const oldData = oldRows[0];

    // =====================================
    // 2 Update booking
    // =====================================
    await connection.query(
      `UPDATE seva_bookings SET
        seva_id=?,
        deity_id=?,
        devotee_id=?,
        devotee_name=?,
        devotee_phone=?,
        devotee_email=?,
        devotee_gotra=?,
        devotee_rashi=?,
        devotee_nakshatra=?,
        devotee_dob=?,
        devotee_gender=?,
        seva_name=?,
        seva_amount=?,
        quantity=?,
        calendar_type=?,
        scheduled_date=?,
        scheduled_time=?,
        payment_method_id=?,
        total_amount=?,
        paid_amount=?,
        payment_status=?,
        status=?,
        remark=?,
        internal_note=?,
        recurring_interval=?,
        is_recurring=?,
        updated_at=NOW()
      WHERE id=? AND organization_id=? AND temple_id=?`,
      [
        seva_id,
        deity_id,
        devotee_id,
        devotee_name,
        devotee_phone,
        devotee_email,
        devotee_gotra,
        devotee_rashi,
        devotee_nakshatra,
        devotee_dob,
        devotee_gender,
        seva_name,
        seva_amount,
        quantity,
        calendar_type,
        scheduled_date,
        scheduled_time,
        payment_method_id,
        total_amount,
        paid_amount,
        payment_status,
        status,
        remark,
        internal_note,
        recurring_interval,
        is_recurring,
        id,
        organization_id,
        temple_id
      ]
    );

    // =====================================
    // 3 Insert audit log
    // =====================================
    const newData = {
      seva_id,
      deity_id,
      devotee_id,
      devotee_name,
      devotee_phone,
      devotee_email,
      devotee_gotra,
      devotee_rashi,
      devotee_nakshatra,
      devotee_dob,
      devotee_gender,
      seva_name,
      seva_amount,
      quantity,
      calendar_type,
      scheduled_date,
      scheduled_time,
      payment_method_id,
      total_amount,
      paid_amount,
      payment_status,
      status,
      remark,
      internal_note,
      recurring_interval,
      is_recurring
    };

    await connection.query(
      `INSERT INTO audit_logs
        (actor_user_id, organization_id, temple_id, table_name, record_id, action, old_data, new_data, created_at)
       VALUES (?, ?, ?, 'seva_bookings', ?, 'update', ?, ?, NOW())`,
      [
        updated_by_user_id,
        organization_id,
        temple_id,
        id,
        JSON.stringify(oldData),
        JSON.stringify(newData)
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Seva booking updated successfully"
    });

  } catch (error: any) {
    await connection.rollback();
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * DELETE BOOKING
 */
export const deleteSevaBooking = async (req: Request, res: Response) => {

  try {

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const { id } = req.params;


    await db.query(

      `UPDATE seva_bookings

       SET deleted_at = NOW()

       WHERE id=?
       AND organization_id=?
       AND temple_id=?`,

      [id, organization_id, temple_id]

    );


    res.json({

      success: true,
      message: "Booking deleted successfully"

    });

  }

  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

/**
 * CANCLE BOOKING
 */
export const cancelSevaBooking = async (req: Request, res: Response) => {
  try {

    const { id } = req.params
    const { remark, scheduled_date } = req.body
    const user = req.user

    let status = "cancelled"

    const today = new Date().toISOString().split("T")[0]

    // If date changed
    if (scheduled_date) {

      if (scheduled_date < today) {
        status = "completed"
      }

      else if (scheduled_date === today) {
        status = "confirmed"
      }

      else {
        status = "booked"
      }

    }

    let query = `
      UPDATE seva_bookings
      SET
        status = ?,
        remark = ?,
        updated_at = NOW()
    `

    const params:any[] = [status, remark || ""]

    if (scheduled_date) {
      query += `, scheduled_date = ?`
      params.push(scheduled_date)
    }

    query += `
      WHERE id = ?
      AND organization_id = ?
      AND temple_id = ?
    `

    params.push(id, user.organization_id, user.temple_id)

    await db.query(query, params)

    res.json({
      success: true,
      message: "Seva booking updated successfully",
      status
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: "Cancel failed"
    })

  }
}
