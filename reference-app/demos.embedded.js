/**
 * reference-app/demos.embedded.js — GENERATED FILE, do not hand-edit.
 * Source: dataset/ (entirely synthetic). Regenerate:
 *   node reference-app/build-embedded-demos.js
 */
(function (global) {
  'use strict';
  var DEMOS = [
  {
    "label": "saas_customer_offboarding-01",
    "family": "saas_customer_offboarding",
    "der": {
      "record_id": "der-00001",
      "record_type": "DER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-25T01:15:42Z",
      "request_context": {
        "request_id": "req-00001",
        "request_type": "CUSTOMER_OFFBOARDING",
        "requested_at": "2026-07-23T14:44:25Z",
        "requesting_role": "compliance_operations",
        "requesting_organization_ref": "org-ref-33e9fb1"
      },
      "data_scope": {
        "data_category": "crm_contact_record",
        "subject_ref": "subject-ref-2a4d7ea",
        "scope_description": "SaaS customer offboarding scenario — synthetic record for dataset testing purposes only.",
        "systems_in_scope": [
          "saas-app-billing-01",
          "saas-app-core-01",
          "saas-app-support-01"
        ],
        "processors_in_scope": [
          "subprocessor-analytics-01"
        ]
      },
      "execution": {
        "execution_status": "EXCEPTION",
        "executed_at": "2026-08-22T21:30:45Z",
        "execution_method_declaration": "Deletion/data-exit executed via standard operational workflow declaration (synthetic).",
        "systems_completed": [
          "saas-app-billing-01"
        ],
        "systems_pending": [
          "saas-app-core-01",
          "saas-app-support-01"
        ]
      },
      "residual_state": {
        "backup_state": "excluded from backup — primary system only",
        "residual_copies_declared": false,
        "legal_hold": false,
        "subprocessor_status": "subprocessor deletion confirmed"
      },
      "evidence_metadata": {
        "source_system_id": "saas-app-billing-01",
        "responsible_party_reference": "party-ref-10ebcc4",
        "recorded_at": "2026-08-25T01:15:42Z",
        "evidence_references": [
          "ticket-000001"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "73377fd921fe58bb85005654396fd0e6b2bf579cd99fa88c37c9ab640f755c7d"
      }
    },
    "ver": {
      "record_id": "ver-00001",
      "record_type": "VER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-21T21:41:19Z",
      "linked_record_id": "der-00001",
      "linked_record_hash": "73377fd921fe58bb85005654396fd0e6b2bf579cd99fa88c37c9ab640f755c7d",
      "verification_type": "periodic_review",
      "verification_status": "EXCEPTION_IDENTIFIED",
      "residual_state_update": "Residual copy identified during follow-up review (synthetic).",
      "exception_reason": "Residual/exception condition identified during verification (synthetic).",
      "evidence_metadata": {
        "recorded_by_reference": "reviewer-ref-4d4bad7",
        "recorded_at": "2026-08-22T02:41:36Z",
        "evidence_references": [
          "review-000001"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "499fa021cf80d5e0717e2f790fb60185e82cd0e07e76d122e87552468a77a1cb"
      }
    }
  },
  {
    "label": "legal_hold-01",
    "family": "legal_hold",
    "der": {
      "record_id": "der-00129",
      "record_type": "DER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-25T09:53:58Z",
      "request_context": {
        "request_id": "req-00129",
        "request_type": "CONTRACT_TERMINATION",
        "requested_at": "2026-06-28T17:01:24Z",
        "requesting_role": "customer_admin",
        "requesting_organization_ref": "org-ref-152f231"
      },
      "data_scope": {
        "data_category": "customer_account_data",
        "subject_ref": "subject-ref-11edb6a",
        "scope_description": "Legal hold scenario — synthetic record for dataset testing purposes only.",
        "systems_in_scope": [
          "saas-app-core-01",
          "saas-app-support-01",
          "crm-system-01"
        ]
      },
      "execution": {
        "execution_status": "LEGAL_HOLD",
        "executed_at": "2026-08-23T20:58:48Z",
        "execution_method_declaration": "Deletion/data-exit executed via standard operational workflow declaration (synthetic).",
        "systems_completed": [
          "saas-app-core-01"
        ],
        "systems_pending": [
          "saas-app-support-01",
          "crm-system-01"
        ]
      },
      "residual_state": {
        "backup_state": "backup purge pending next rotation cycle",
        "residual_copies_declared": false,
        "legal_hold": true
      },
      "evidence_metadata": {
        "source_system_id": "saas-app-core-01",
        "responsible_party_reference": "party-ref-1419544",
        "recorded_at": "2026-08-25T09:53:58Z",
        "evidence_references": [
          "ticket-000129"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "dc3731ccf22c7d0fd9c103429a969c4d1de68a0277ae08f20f83b52d724f3db5"
      }
    },
    "ver": {
      "record_id": "ver-00129",
      "record_type": "VER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-26T01:06:27Z",
      "linked_record_id": "der-00129",
      "linked_record_hash": "dc3731ccf22c7d0fd9c103429a969c4d1de68a0277ae08f20f83b52d724f3db5",
      "verification_type": "internal_QA_review",
      "verification_status": "EXCEPTION_IDENTIFIED",
      "residual_state_update": "Residual copy identified during follow-up review (synthetic).",
      "exception_reason": "Residual/exception condition identified during verification (synthetic).",
      "evidence_metadata": {
        "recorded_by_reference": "reviewer-ref-1303857",
        "recorded_at": "2026-08-25T08:01:19Z",
        "evidence_references": [
          "review-000129"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "a918818ffb876b5a4a1734ab733897e6251198871d3821edb6645edf35bd7983"
      }
    }
  },
  {
    "label": "residual_backup-01",
    "family": "residual_backup",
    "der": {
      "record_id": "der-00241",
      "record_type": "DER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-26T06:06:54Z",
      "request_context": {
        "request_id": "req-00241",
        "request_type": "DATA_SUBJECT_REQUEST",
        "requested_at": "2026-07-16T23:02:36Z",
        "requesting_role": "procurement",
        "requesting_organization_ref": "org-ref-12232a1"
      },
      "data_scope": {
        "data_category": "support_ticket_record",
        "subject_ref": "subject-ref-5bf7f7a",
        "scope_description": "Residual backup scenario — synthetic record for dataset testing purposes only.",
        "systems_in_scope": [
          "cloud-storage-archive-01",
          "cloud-storage-primary-01"
        ]
      },
      "execution": {
        "execution_status": "PENDING_SUBPROCESSOR",
        "executed_at": "2026-08-14T20:40:57Z",
        "execution_method_declaration": "Deletion/data-exit executed via standard operational workflow declaration (synthetic).",
        "systems_completed": [
          "cloud-storage-archive-01"
        ],
        "systems_pending": [
          "cloud-storage-primary-01"
        ]
      },
      "residual_state": {
        "backup_state": "backup purge pending next rotation cycle",
        "residual_copies_declared": true,
        "retention_exception": "Residual copy identified in secondary storage tier (synthetic).",
        "legal_hold": false
      },
      "evidence_metadata": {
        "source_system_id": "cloud-storage-archive-01",
        "responsible_party_reference": "party-ref-af5694",
        "recorded_at": "2026-08-26T06:06:54Z",
        "evidence_references": [
          "ticket-000241"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "b15d437248b7005f49423bace7c4594c77634d673a9e6404c8756ac2da3219be"
      }
    },
    "ver": {
      "record_id": "ver-00241",
      "record_type": "VER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-24T00:31:01Z",
      "linked_record_id": "der-00241",
      "linked_record_hash": "b15d437248b7005f49423bace7c4594c77634d673a9e6404c8756ac2da3219be",
      "verification_type": "subprocessor_confirmation",
      "verification_status": "RESIDUAL_COPY_IDENTIFIED",
      "residual_state_update": "Residual copy identified during follow-up review (synthetic).",
      "exception_reason": "Residual/exception condition identified during verification (synthetic).",
      "evidence_metadata": {
        "recorded_by_reference": "reviewer-ref-3c7a87",
        "recorded_at": "2026-08-24T00:29:55Z",
        "evidence_references": [
          "review-000241"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "f4e0abdfa04bda6ad83aea760691b365c6cd510396a0d9861fbdd5265b0f79d8"
      }
    }
  },
  {
    "label": "delayed_subprocessor_deletion-01",
    "family": "delayed_subprocessor_deletion",
    "der": {
      "record_id": "der-00209",
      "record_type": "DER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-25T11:45:31Z",
      "request_context": {
        "request_id": "req-00209",
        "request_type": "CUSTOMER_OFFBOARDING",
        "requested_at": "2026-07-18T10:07:17Z",
        "requesting_role": "procurement",
        "requesting_organization_ref": "org-ref-4980e81"
      },
      "data_scope": {
        "data_category": "support_ticket_record",
        "subject_ref": "subject-ref-2b1d9a",
        "scope_description": "Delayed subprocessor deletion scenario — synthetic record for dataset testing purposes only.",
        "systems_in_scope": [
          "saas-app-billing-01",
          "saas-app-support-01",
          "saas-app-core-01"
        ],
        "processors_in_scope": [
          "subprocessor-email-01",
          "subprocessor-analytics-01"
        ]
      },
      "execution": {
        "execution_status": "PENDING_SUBPROCESSOR",
        "executed_at": "2026-08-22T11:07:42Z",
        "execution_method_declaration": "Deletion/data-exit executed via standard operational workflow declaration (synthetic).",
        "systems_completed": [
          "saas-app-billing-01"
        ],
        "systems_pending": [
          "saas-app-support-01",
          "saas-app-core-01"
        ]
      },
      "residual_state": {
        "backup_state": "excluded from backup — primary system only",
        "residual_copies_declared": false,
        "legal_hold": false,
        "subprocessor_status": "subprocessor deletion confirmation outstanding"
      },
      "evidence_metadata": {
        "source_system_id": "saas-app-billing-01",
        "responsible_party_reference": "party-ref-51b0934",
        "recorded_at": "2026-08-25T11:45:31Z",
        "evidence_references": [
          "ticket-000209"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "9fdcb7c288090ebfeb9d8d3c22988261b83d8b638cf82ac948a942f12ff62fae"
      }
    },
    "ver": {
      "record_id": "ver-00209",
      "record_type": "VER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-25T21:00:21Z",
      "linked_record_id": "der-00209",
      "linked_record_hash": "9fdcb7c288090ebfeb9d8d3c22988261b83d8b638cf82ac948a942f12ff62fae",
      "verification_type": "audit_spot_check",
      "verification_status": "SUBPROCESSOR_PENDING",
      "subprocessor_update": "Subprocessor deletion confirmation still outstanding at time of review (synthetic).",
      "evidence_metadata": {
        "recorded_by_reference": "reviewer-ref-59e03e7",
        "recorded_at": "2026-08-25T21:42:50Z",
        "evidence_references": [
          "review-000209"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "949c4659a5257a2b3f1300b015143a215cef955820de799dbc6d7a438d98ff89"
      }
    }
  },
  {
    "label": "multi_system_deletion-01",
    "family": "multi_system_deletion",
    "der": {
      "record_id": "der-00289",
      "record_type": "DER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-25T14:52:58Z",
      "request_context": {
        "request_id": "req-00289",
        "request_type": "CUSTOMER_OFFBOARDING",
        "requested_at": "2026-07-30T09:03:59Z",
        "requesting_role": "account_owner",
        "requesting_organization_ref": "org-ref-1e749d1"
      },
      "data_scope": {
        "data_category": "employee_hr_record",
        "subject_ref": "subject-ref-52d40ca",
        "scope_description": "Multi-system deletion scenario — synthetic record for dataset testing purposes only.",
        "systems_in_scope": [
          "marketing-platform-email-02"
        ],
        "processors_in_scope": [
          "subprocessor-support-tooling-01",
          "subprocessor-logistics-01"
        ]
      },
      "execution": {
        "execution_status": "COMPLETE",
        "executed_at": "2026-08-18T23:47:47Z",
        "execution_method_declaration": "Deletion/data-exit executed via standard operational workflow declaration (synthetic).",
        "systems_completed": [
          "marketing-platform-email-02"
        ],
        "systems_pending": []
      },
      "residual_state": {
        "backup_state": "backup purge pending next rotation cycle",
        "residual_copies_declared": false,
        "legal_hold": false,
        "subprocessor_status": "subprocessor deletion confirmed"
      },
      "evidence_metadata": {
        "source_system_id": "marketing-platform-email-02",
        "responsible_party_reference": "party-ref-2fe9c24",
        "recorded_at": "2026-08-25T14:52:58Z",
        "evidence_references": [
          "ticket-000289"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "3f7cc76ebf5bcde73fe735955552759b12c9546a35e7029611f24a7cf7c44436"
      }
    },
    "ver": {
      "record_id": "ver-00289",
      "record_type": "VER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-23T00:14:49Z",
      "linked_record_id": "der-00289",
      "linked_record_hash": "3f7cc76ebf5bcde73fe735955552759b12c9546a35e7029611f24a7cf7c44436",
      "verification_type": "internal_QA_review",
      "verification_status": "CONFIRMED",
      "evidence_metadata": {
        "recorded_by_reference": "reviewer-ref-415ee77",
        "recorded_at": "2026-08-25T01:05:49Z",
        "evidence_references": [
          "review-000289"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "e468262c8551e59df413f0d342a8510a747c829415e781346ac616918e13ecbe"
      }
    }
  },
  {
    "label": "correction_after_verification-01",
    "family": "correction_after_verification",
    "der": {
      "record_id": "der-00273",
      "record_type": "DER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-26T04:55:41Z",
      "request_context": {
        "request_id": "req-00273",
        "request_type": "ADMINISTRATIVE_DELETION",
        "requested_at": "2026-06-02T08:56:02Z",
        "requesting_role": "compliance_operations",
        "requesting_organization_ref": "org-ref-3a237c1"
      },
      "data_scope": {
        "data_category": "migrated_workload_data",
        "subject_ref": "subject-ref-55e005a",
        "scope_description": "Correction after verification scenario — synthetic record for dataset testing purposes only.",
        "systems_in_scope": [
          "saas-app-support-01",
          "crm-system-01",
          "saas-app-core-01"
        ]
      },
      "execution": {
        "execution_status": "FAILED",
        "executed_at": null,
        "execution_method_declaration": "Deletion/data-exit executed via standard operational workflow declaration (synthetic).",
        "systems_completed": [],
        "systems_pending": [
          "saas-app-support-01",
          "crm-system-01",
          "saas-app-core-01"
        ]
      },
      "residual_state": {
        "backup_state": "excluded from backup — primary system only",
        "residual_copies_declared": false,
        "legal_hold": false
      },
      "evidence_metadata": {
        "source_system_id": "saas-app-support-01",
        "responsible_party_reference": "party-ref-23984f4",
        "recorded_at": "2026-08-26T04:55:41Z",
        "evidence_references": [
          "ticket-000273"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "3206eb6b5738c1263fa808c2a77b5fe1139f7bdf7ee3e7f10bf1361363f4f9b2"
      }
    },
    "ver": {
      "record_id": "ver-00273",
      "record_type": "VER",
      "schema_version": "0.1.0",
      "timestamp": "2026-08-25T08:13:46Z",
      "linked_record_id": "der-00273",
      "linked_record_hash": "3206eb6b5738c1263fa808c2a77b5fe1139f7bdf7ee3e7f10bf1361363f4f9b2",
      "verification_type": "internal_QA_review",
      "verification_status": "CORRECTED",
      "review_note": "Original DER execution_status corrected following follow-up review (synthetic).",
      "evidence_metadata": {
        "recorded_by_reference": "reviewer-ref-d0d227",
        "recorded_at": "2026-08-25T14:18:50Z",
        "evidence_references": [
          "review-000273"
        ],
        "canonicalization_method": "der-ver-canonical-json-v0.1",
        "record_hash": "0ada133f0e01da2e18932cb4b66e555992d6cc7fc3c90d55a3234b7c68f03df5"
      }
    }
  }
];
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEMOS;
  } else {
    global.DER_DEMOS = DEMOS;
  }
})(typeof window !== 'undefined' ? window : globalThis);
