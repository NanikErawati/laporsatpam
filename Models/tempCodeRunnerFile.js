   if (tanggal) {
      values.push(tanggal);
      query += ` AND tanggal = $${paramIndex}`;

    }
    if (shift) {
      values.push(shift);
      query += ` AND shift = $${paramIndex}`;
      paramIndex++;
    }
