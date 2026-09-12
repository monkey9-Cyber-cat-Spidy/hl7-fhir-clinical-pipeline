import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Hl7ToFhirConverter } from '../src/hl7Converter.mjs';

describe('HL7 to FHIR Clinical Pipeline Suite', () => {
  const conv = new Hl7ToFhirConverter();

  test('should transform valid HL7 v2 ADT segment into FHIR R4 Patient JSON', () => {
    const hl7 = [
      'MSH|^~\\&|EPIC|HOSPITAL|RECEIVER|FACILITY|20261017120000||ADT^A01|MSG001|P|2.5',
      'PID|1||MRN98231||DOE^JOHN||19850614|M'
    ].join('\n');

    const fhir = conv.convertToFhir(hl7);
    assert.strictEqual(fhir.resourceType, 'Patient');
    assert.strictEqual(fhir.id, 'MRN98231');
    assert.strictEqual(fhir.name[0].family, 'DOE');
    assert.strictEqual(fhir.name[0].given[0], 'JOHN');
    assert.strictEqual(fhir.gender, 'male');
    assert.strictEqual(fhir.birthDate, '1985-06-14');
  });

  test('should fail when PID segment is missing', () => {
    const hl7 = 'MSH|^~\\&|EPIC|HOSPITAL|RECEIVER|FACILITY|20261017||ADT^A01|MSG002|P|2.5';
    assert.throws(() => conv.convertToFhir(hl7), /missing mandatory MSH or PID segment/);
  });
});
