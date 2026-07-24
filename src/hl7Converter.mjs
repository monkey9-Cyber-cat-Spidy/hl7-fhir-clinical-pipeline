export class Hl7ToFhirConverter {
  parseHl7(hl7Raw) {
    const lines = hl7Raw.trim().split(/\r?\n/);
    const segments = {};
    for (const line of lines) {
      const parts = line.split('|');
      const tag = parts[0];
      segments[tag] = parts;
    }
    return segments;
  }

  convertToFhir(hl7Raw) {
    const segs = this.parseHl7(hl7Raw);
    if (!segs.MSH || !segs.PID) {
      throw new Error('Invalid HL7 v2 message: missing mandatory MSH or PID segment');
    }

    const pidParts = segs.PID;
    const patientId = pidParts[3] || 'UNKNOWN';
    const names = (pidParts[5] || '').split('^');
    const familyName = names[0] || '';
    const givenName = names[1] || '';
    const birthDateRaw = pidParts[7] || ''; // YYYYMMDD
    const genderRaw = pidParts[8] || 'U';

    const genderMap = { M: 'male', F: 'female', O: 'other', U: 'unknown' };

    const fhirPatient = {
      resourceType: 'Patient',
      id: patientId,
      identifier: [{ system: 'urn:hospital:mrn', value: patientId }],
      name: [{ family: familyName, given: [givenName] }],
      gender: genderMap[genderRaw] || 'unknown'
    };

    if (birthDateRaw.length === 8) {
      fhirPatient.birthDate = `${birthDateRaw.substring(0, 4)}-${birthDateRaw.substring(4, 6)}-${birthDateRaw.substring(6, 8)}`;
    }

    return fhirPatient;
  }
}
