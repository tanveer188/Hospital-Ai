PGDMP  7    ,                }            hospital_db_main    17.4    17.4 �    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    18735    hospital_db_main    DATABASE     v   CREATE DATABASE hospital_db_main WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en-US';
     DROP DATABASE hospital_db_main;
                     admin1    false                        3079    18736 	   uuid-ossp 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    DROP EXTENSION "uuid-ossp";
                        false            �           0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                             false    2                       1255    19062    check_slot_availability()    FUNCTION       CREATE FUNCTION public.check_slot_availability() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Must be available
    IF NOT EXISTS (
        SELECT 1 FROM time_slots
        WHERE slot_id = NEW.slot_id
          AND is_available = TRUE
    ) THEN
        RAISE EXCEPTION 'Time slot % is not available', NEW.slot_id;
    END IF;

    -- Mark it unavailable
    UPDATE time_slots
       SET is_available = FALSE,
           updated_at    = CURRENT_TIMESTAMP
     WHERE slot_id = NEW.slot_id;
    RETURN NEW;
END;
$$;
 0   DROP FUNCTION public.check_slot_availability();
       public               postgres    false            #           1255    19064 )   find_available_slots(text, date, integer)    FUNCTION       CREATE FUNCTION public.find_available_slots(doctor_name text, search_date date, limit_results integer DEFAULT 5) RETURNS TABLE(slot_id integer, doctor_full_name text, specialization character varying, start_time timestamp without time zone, end_time timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
      ts.slot_id,
      u.first_name || ' ' || u.last_name AS doctor_full_name,
      d.specialization,
      ts.start_time,
      ts.end_time
    FROM time_slots ts
    JOIN Doctors d ON ts.doctor_id = d.doctor_id
    JOIN Users u   ON d.user_id   = u.user_id
    WHERE ts.is_available = TRUE
      AND (
        doctor_name IS NULL OR
        u.first_name ILIKE '%' || doctor_name || '%' OR
        u.last_name  ILIKE '%' || doctor_name || '%' OR
        (u.first_name || ' ' || u.last_name) ILIKE '%' || doctor_name || '%'
      )
      AND (
        search_date IS NULL OR
        DATE(ts.start_time) = search_date
      )
    ORDER BY ts.start_time
    LIMIT limit_results;
END;
$$;
 f   DROP FUNCTION public.find_available_slots(doctor_name text, search_date date, limit_results integer);
       public               postgres    false            �            1259    19028    appointments    TABLE     �  CREATE TABLE public.appointments (
    appointment_id integer NOT NULL,
    patient_id integer NOT NULL,
    slot_id integer NOT NULL,
    patient_name text NOT NULL,
    phone_number text NOT NULL,
    doctor_name text NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    reason text,
    notes text,
    diagnosis text,
    follow_up_date date,
    created_by integer,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['payment_pending'::character varying, 'scheduled'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'no_show'::character varying])::text[])))
);
     DROP TABLE public.appointments;
       public         heap r       postgres    false            �            1259    19027    appointments_appointment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.appointments_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.appointments_appointment_id_seq;
       public               postgres    false    251            �           0    0    appointments_appointment_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments.appointment_id;
          public               postgres    false    250            �            1259    18996    billingaddresses    TABLE     �  CREATE TABLE public.billingaddresses (
    address_id integer NOT NULL,
    patient_id integer NOT NULL,
    street character varying(100),
    city character varying(100),
    state character varying(100),
    zip_code character varying(20),
    country character varying(100),
    is_default boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 $   DROP TABLE public.billingaddresses;
       public         heap r       postgres    false            �            1259    18995    billingaddresses_address_id_seq    SEQUENCE     �   CREATE SEQUENCE public.billingaddresses_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.billingaddresses_address_id_seq;
       public               postgres    false    247            �           0    0    billingaddresses_address_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.billingaddresses_address_id_seq OWNED BY public.billingaddresses.address_id;
          public               postgres    false    246                       1259    19186    billingitems    TABLE       CREATE TABLE public.billingitems (
    item_id integer NOT NULL,
    billing_id integer NOT NULL,
    description text NOT NULL,
    quantity numeric(10,2) DEFAULT 1.00 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    tax numeric(12,2) DEFAULT 0.00 NOT NULL,
    discount numeric(12,2) DEFAULT 0.00 NOT NULL,
    line_total numeric(12,2) GENERATED ALWAYS AS ((((quantity * unit_price) * ((1)::numeric - (discount / (100)::numeric))) + tax)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
     DROP TABLE public.billingitems;
       public         heap r       postgres    false                       1259    19185    billingitems_item_id_seq    SEQUENCE     �   CREATE SEQUENCE public.billingitems_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.billingitems_item_id_seq;
       public               postgres    false    264            �           0    0    billingitems_item_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.billingitems_item_id_seq OWNED BY public.billingitems.item_id;
          public               postgres    false    263                       1259    19149    billings    TABLE     �  CREATE TABLE public.billings (
    billing_id integer NOT NULL,
    patient_id integer NOT NULL,
    appointment_id integer,
    invoice_number character varying(50) NOT NULL,
    date_issued timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date date,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    tax numeric(12,2) DEFAULT 0.00 NOT NULL,
    discount numeric(12,2) DEFAULT 0.00 NOT NULL,
    total numeric(12,2) DEFAULT 0.00 NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0.00 NOT NULL,
    balance numeric(12,2) GENERATED ALWAYS AS ((total - amount_paid)) STORED,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    payment_method character varying(50),
    payment_details jsonb,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT billings_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'sent'::character varying, 'paid'::character varying, 'partially_paid'::character varying, 'overdue'::character varying, 'cancelled'::character varying])::text[])))
);
    DROP TABLE public.billings;
       public         heap r       postgres    false                       1259    19148    billings_billing_id_seq    SEQUENCE     �   CREATE SEQUENCE public.billings_billing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.billings_billing_id_seq;
       public               postgres    false    262            �           0    0    billings_billing_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.billings_billing_id_seq OWNED BY public.billings.billing_id;
          public               postgres    false    261            �            1259    18980    communicationpreferences    TABLE     G  CREATE TABLE public.communicationpreferences (
    preference_id integer NOT NULL,
    patient_id integer NOT NULL,
    email_notifications boolean DEFAULT false,
    sms_notifications boolean DEFAULT false,
    phone_notifications boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 ,   DROP TABLE public.communicationpreferences;
       public         heap r       postgres    false            �            1259    18979 *   communicationpreferences_preference_id_seq    SEQUENCE     �   CREATE SEQUENCE public.communicationpreferences_preference_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 A   DROP SEQUENCE public.communicationpreferences_preference_id_seq;
       public               postgres    false    245            �           0    0 *   communicationpreferences_preference_id_seq    SEQUENCE OWNED BY     y   ALTER SEQUENCE public.communicationpreferences_preference_id_seq OWNED BY public.communicationpreferences.preference_id;
          public               postgres    false    244            �            1259    18864    doctorhospitalaffiliations    TABLE     f  CREATE TABLE public.doctorhospitalaffiliations (
    affiliation_id integer NOT NULL,
    doctor_id integer NOT NULL,
    hospital_name character varying(100) NOT NULL,
    "position" character varying(100),
    start_date date,
    end_date date,
    is_current boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 .   DROP TABLE public.doctorhospitalaffiliations;
       public         heap r       postgres    false            �            1259    18863 -   doctorhospitalaffiliations_affiliation_id_seq    SEQUENCE     �   CREATE SEQUENCE public.doctorhospitalaffiliations_affiliation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 D   DROP SEQUENCE public.doctorhospitalaffiliations_affiliation_id_seq;
       public               postgres    false    231            �           0    0 -   doctorhospitalaffiliations_affiliation_id_seq    SEQUENCE OWNED BY        ALTER SEQUENCE public.doctorhospitalaffiliations_affiliation_id_seq OWNED BY public.doctorhospitalaffiliations.affiliation_id;
          public               postgres    false    230            �            1259    18817    doctorqualifications    TABLE     0  CREATE TABLE public.doctorqualifications (
    qualification_id integer NOT NULL,
    doctor_id integer NOT NULL,
    qualification character varying(100) NOT NULL,
    institution character varying(100),
    year_obtained integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 (   DROP TABLE public.doctorqualifications;
       public         heap r       postgres    false            �            1259    18816 )   doctorqualifications_qualification_id_seq    SEQUENCE     �   CREATE SEQUENCE public.doctorqualifications_qualification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 @   DROP SEQUENCE public.doctorqualifications_qualification_id_seq;
       public               postgres    false    225            �           0    0 )   doctorqualifications_qualification_id_seq    SEQUENCE OWNED BY     w   ALTER SEQUENCE public.doctorqualifications_qualification_id_seq OWNED BY public.doctorqualifications.qualification_id;
          public               postgres    false    224            �            1259    18878    doctorratings    TABLE     �  CREATE TABLE public.doctorratings (
    rating_id integer NOT NULL,
    doctor_id integer NOT NULL,
    patient_id integer NOT NULL,
    rating integer NOT NULL,
    review text,
    rating_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctorratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
 !   DROP TABLE public.doctorratings;
       public         heap r       postgres    false            �            1259    18877    doctorratings_rating_id_seq    SEQUENCE     �   CREATE SEQUENCE public.doctorratings_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.doctorratings_rating_id_seq;
       public               postgres    false    233            �           0    0    doctorratings_rating_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.doctorratings_rating_id_seq OWNED BY public.doctorratings.rating_id;
          public               postgres    false    232            �            1259    18793    doctors    TABLE     +  CREATE TABLE public.doctors (
    doctor_id integer NOT NULL,
    user_id integer NOT NULL,
    license_number character varying(50) NOT NULL,
    specialization character varying(100) NOT NULL,
    years_of_experience integer,
    bio text,
    department character varying(100) NOT NULL,
    average_consultation_time integer DEFAULT 15,
    average_rating numeric(3,2) DEFAULT 0.00,
    emr_access_level character varying(20) DEFAULT 'full'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctors_emr_access_level_check CHECK (((emr_access_level)::text = ANY ((ARRAY['full'::character varying, 'partial'::character varying, 'restricted'::character varying])::text[])))
);
    DROP TABLE public.doctors;
       public         heap r       postgres    false            �            1259    18792    doctors_doctor_id_seq    SEQUENCE     �   CREATE SEQUENCE public.doctors_doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.doctors_doctor_id_seq;
       public               postgres    false    223            �           0    0    doctors_doctor_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.doctors_doctor_id_seq OWNED BY public.doctors.doctor_id;
          public               postgres    false    222            �            1259    18830    doctorworkingdays    TABLE     �  CREATE TABLE public.doctorworkingdays (
    working_day_id integer NOT NULL,
    doctor_id integer NOT NULL,
    day character varying(10) NOT NULL,
    start_time character varying(10) NOT NULL,
    end_time character varying(10) NOT NULL,
    is_working boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctorworkingdays_day_check CHECK (((day)::text = ANY ((ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying])::text[])))
);
 %   DROP TABLE public.doctorworkingdays;
       public         heap r       postgres    false            �            1259    18829 $   doctorworkingdays_working_day_id_seq    SEQUENCE     �   CREATE SEQUENCE public.doctorworkingdays_working_day_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.doctorworkingdays_working_day_id_seq;
       public               postgres    false    227            �           0    0 $   doctorworkingdays_working_day_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.doctorworkingdays_working_day_id_seq OWNED BY public.doctorworkingdays.working_day_id;
          public               postgres    false    226            �            1259    18966    emergencycontacts    TABLE       CREATE TABLE public.emergencycontacts (
    contact_id integer NOT NULL,
    patient_id integer NOT NULL,
    name character varying(100) NOT NULL,
    relationship character varying(50) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(100),
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 %   DROP TABLE public.emergencycontacts;
       public         heap r       postgres    false            �            1259    18965     emergencycontacts_contact_id_seq    SEQUENCE     �   CREATE SEQUENCE public.emergencycontacts_contact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.emergencycontacts_contact_id_seq;
       public               postgres    false    243            �           0    0     emergencycontacts_contact_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.emergencycontacts_contact_id_seq OWNED BY public.emergencycontacts.contact_id;
          public               postgres    false    242                       1259    19129    emraccesslog    TABLE     2  CREATE TABLE public.emraccesslog (
    access_id integer NOT NULL,
    record_id integer NOT NULL,
    user_id integer NOT NULL,
    access_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    purpose character varying(255),
    ip_address character varying(45),
    user_agent text
);
     DROP TABLE public.emraccesslog;
       public         heap r       postgres    false                       1259    19128    emraccesslog_access_id_seq    SEQUENCE     �   CREATE SEQUENCE public.emraccesslog_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.emraccesslog_access_id_seq;
       public               postgres    false    260            �           0    0    emraccesslog_access_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.emraccesslog_access_id_seq OWNED BY public.emraccesslog.access_id;
          public               postgres    false    259            �            1259    19090    emrfiles    TABLE     Y  CREATE TABLE public.emrfiles (
    file_id integer NOT NULL,
    record_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(50),
    upload_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    file_size bigint,
    checksum character varying(64)
);
    DROP TABLE public.emrfiles;
       public         heap r       postgres    false            �            1259    19089    emrfiles_file_id_seq    SEQUENCE     �   CREATE SEQUENCE public.emrfiles_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.emrfiles_file_id_seq;
       public               postgres    false    255            �           0    0    emrfiles_file_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.emrfiles_file_id_seq OWNED BY public.emrfiles.file_id;
          public               postgres    false    254            �            1259    19066 
   emrrecords    TABLE     �  CREATE TABLE public.emrrecords (
    record_id integer NOT NULL,
    patient_id integer NOT NULL,
    created_by integer NOT NULL,
    record_type character varying(20) NOT NULL,
    record_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    is_sensitive boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT emrrecords_record_type_check CHECK (((record_type)::text = ANY ((ARRAY['consultation'::character varying, 'lab_result'::character varying, 'imaging'::character varying, 'prescription'::character varying, 'vaccination'::character varying, 'surgery'::character varying, 'allergy'::character varying, 'chronic_condition'::character varying])::text[])))
);
    DROP TABLE public.emrrecords;
       public         heap r       postgres    false            �            1259    19065    emrrecords_record_id_seq    SEQUENCE     �   CREATE SEQUENCE public.emrrecords_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.emrrecords_record_id_seq;
       public               postgres    false    253            �           0    0    emrrecords_record_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.emrrecords_record_id_seq OWNED BY public.emrrecords.record_id;
          public               postgres    false    252                       1259    19113    emrrecordtags    TABLE     c   CREATE TABLE public.emrrecordtags (
    record_id integer NOT NULL,
    tag_id integer NOT NULL
);
 !   DROP TABLE public.emrrecordtags;
       public         heap r       postgres    false                       1259    19105    emrtags    TABLE     j   CREATE TABLE public.emrtags (
    tag_id integer NOT NULL,
    tag_name character varying(50) NOT NULL
);
    DROP TABLE public.emrtags;
       public         heap r       postgres    false                        1259    19104    emrtags_tag_id_seq    SEQUENCE     �   CREATE SEQUENCE public.emrtags_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.emrtags_tag_id_seq;
       public               postgres    false    257            �           0    0    emrtags_tag_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.emrtags_tag_id_seq OWNED BY public.emrtags.tag_id;
          public               postgres    false    256            
           1259    19205    insuranceclaims    TABLE     �  CREATE TABLE public.insuranceclaims (
    claim_id integer NOT NULL,
    billing_id integer NOT NULL,
    is_claimed boolean DEFAULT false NOT NULL,
    claim_number character varying(50),
    status character varying(50),
    amount_covered numeric(12,2) DEFAULT 0.00,
    submitted_date timestamp without time zone,
    processed_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 #   DROP TABLE public.insuranceclaims;
       public         heap r       postgres    false            	           1259    19204    insuranceclaims_claim_id_seq    SEQUENCE     �   CREATE SEQUENCE public.insuranceclaims_claim_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.insuranceclaims_claim_id_seq;
       public               postgres    false    266            �           0    0    insuranceclaims_claim_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.insuranceclaims_claim_id_seq OWNED BY public.insuranceclaims.claim_id;
          public               postgres    false    265            �            1259    18953    insuranceproviders    TABLE     �  CREATE TABLE public.insuranceproviders (
    insurance_id integer NOT NULL,
    patient_id integer NOT NULL,
    name character varying(100) NOT NULL,
    policy_number character varying(50) NOT NULL,
    group_number character varying(50),
    effective_date date,
    expiration_date date,
    primary_holder_name character varying(100),
    primary_holder_relationship character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 &   DROP TABLE public.insuranceproviders;
       public         heap r       postgres    false            �            1259    18952 #   insuranceproviders_insurance_id_seq    SEQUENCE     �   CREATE SEQUENCE public.insuranceproviders_insurance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE public.insuranceproviders_insurance_id_seq;
       public               postgres    false    241            �           0    0 #   insuranceproviders_insurance_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE public.insuranceproviders_insurance_id_seq OWNED BY public.insuranceproviders.insurance_id;
          public               postgres    false    240            �            1259    18902    patientallergies    TABLE     �  CREATE TABLE public.patientallergies (
    allergy_id integer NOT NULL,
    patient_id integer NOT NULL,
    name character varying(100) NOT NULL,
    severity character varying(20) NOT NULL,
    reaction text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patientallergies_severity_check CHECK (((severity)::text = ANY ((ARRAY['Mild'::character varying, 'Moderate'::character varying, 'Severe'::character varying])::text[])))
);
 $   DROP TABLE public.patientallergies;
       public         heap r       postgres    false            �            1259    18901    patientallergies_allergy_id_seq    SEQUENCE     �   CREATE SEQUENCE public.patientallergies_allergy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.patientallergies_allergy_id_seq;
       public               postgres    false    235            �           0    0    patientallergies_allergy_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.patientallergies_allergy_id_seq OWNED BY public.patientallergies.allergy_id;
          public               postgres    false    234            �            1259    18918    patientchronicconditions    TABLE       CREATE TABLE public.patientchronicconditions (
    condition_id integer NOT NULL,
    patient_id integer NOT NULL,
    condition_name character varying(100) NOT NULL,
    diagnosed_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 ,   DROP TABLE public.patientchronicconditions;
       public         heap r       postgres    false            �            1259    18917 )   patientchronicconditions_condition_id_seq    SEQUENCE     �   CREATE SEQUENCE public.patientchronicconditions_condition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 @   DROP SEQUENCE public.patientchronicconditions_condition_id_seq;
       public               postgres    false    237            �           0    0 )   patientchronicconditions_condition_id_seq    SEQUENCE OWNED BY     w   ALTER SEQUENCE public.patientchronicconditions_condition_id_seq OWNED BY public.patientchronicconditions.condition_id;
          public               postgres    false    236            �            1259    18933    patientmedications    TABLE     �  CREATE TABLE public.patientmedications (
    medication_id integer NOT NULL,
    patient_id integer NOT NULL,
    name character varying(100) NOT NULL,
    dosage character varying(50) NOT NULL,
    frequency character varying(50) NOT NULL,
    prescribed_by integer,
    start_date date,
    end_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 &   DROP TABLE public.patientmedications;
       public         heap r       postgres    false            �            1259    18932 $   patientmedications_medication_id_seq    SEQUENCE     �   CREATE SEQUENCE public.patientmedications_medication_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.patientmedications_medication_id_seq;
       public               postgres    false    239            �           0    0 $   patientmedications_medication_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.patientmedications_medication_id_seq OWNED BY public.patientmedications.medication_id;
          public               postgres    false    238            �            1259    18778    patients    TABLE     <  CREATE TABLE public.patients (
    patient_id integer NOT NULL,
    user_id integer NOT NULL,
    blood_type character varying(3),
    preferred_language character varying(50),
    emr_access_token character varying(255),
    emr_access_expiry timestamp without time zone,
    CONSTRAINT patients_blood_type_check CHECK (((blood_type)::text = ANY ((ARRAY['A+'::character varying, 'A-'::character varying, 'B+'::character varying, 'B-'::character varying, 'AB+'::character varying, 'AB-'::character varying, 'O+'::character varying, 'O-'::character varying])::text[])))
);
    DROP TABLE public.patients;
       public         heap r       postgres    false            �            1259    18777    patients_patient_id_seq    SEQUENCE     �   CREATE SEQUENCE public.patients_patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.patients_patient_id_seq;
       public               postgres    false    221            �           0    0    patients_patient_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.patients_patient_id_seq OWNED BY public.patients.patient_id;
          public               postgres    false    220            �            1259    19010    paymentmethods    TABLE     F  CREATE TABLE public.paymentmethods (
    payment_method_id integer NOT NULL,
    patient_id integer NOT NULL,
    type character varying(20) NOT NULL,
    details jsonb NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT paymentmethods_type_check CHECK (((type)::text = ANY ((ARRAY['credit_card'::character varying, 'debit_card'::character varying, 'bank_account'::character varying, 'insurance'::character varying])::text[])))
);
 "   DROP TABLE public.paymentmethods;
       public         heap r       postgres    false            �            1259    19009 $   paymentmethods_payment_method_id_seq    SEQUENCE     �   CREATE SEQUENCE public.paymentmethods_payment_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE public.paymentmethods_payment_method_id_seq;
       public               postgres    false    249            �           0    0 $   paymentmethods_payment_method_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE public.paymentmethods_payment_method_id_seq OWNED BY public.paymentmethods.payment_method_id;
          public               postgres    false    248                       1259    19224    paymenttransactions    TABLE     �  CREATE TABLE public.paymenttransactions (
    payment_id integer NOT NULL,
    billing_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_details jsonb,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_by integer,
    reference_number character varying(100),
    status character varying(20),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT paymenttransactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);
 '   DROP TABLE public.paymenttransactions;
       public         heap r       postgres    false                       1259    19223 "   paymenttransactions_payment_id_seq    SEQUENCE     �   CREATE SEQUENCE public.paymenttransactions_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE public.paymenttransactions_payment_id_seq;
       public               postgres    false    268            �           0    0 "   paymenttransactions_payment_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE public.paymenttransactions_payment_id_seq OWNED BY public.paymenttransactions.payment_id;
          public               postgres    false    267            �            1259    18847 
   time_slots    TABLE     3  CREATE TABLE public.time_slots (
    slot_id integer NOT NULL,
    doctor_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_hour_slot CHECK (((EXTRACT(epoch FROM (end_time - start_time)) / (3600)::numeric) = (1)::numeric)),
    CONSTRAINT valid_time_slot CHECK ((end_time > start_time))
);
    DROP TABLE public.time_slots;
       public         heap r       postgres    false            �            1259    18846    time_slots_slot_id_seq    SEQUENCE     �   CREATE SEQUENCE public.time_slots_slot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.time_slots_slot_id_seq;
       public               postgres    false    229            �           0    0    time_slots_slot_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.time_slots_slot_id_seq OWNED BY public.time_slots.slot_id;
          public               postgres    false    228            �            1259    18748    users    TABLE       CREATE TABLE public.users (
    user_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    date_of_birth date NOT NULL,
    gender character varying(20),
    phone character varying(20) NOT NULL,
    alternate_phone character varying(20),
    email character varying(100) NOT NULL,
    street character varying(100),
    city character varying(100),
    state character varying(100),
    zip_code character varying(20),
    country character varying(100),
    username character varying(50),
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    account_created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    profile_picture_url character varying(255),
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    two_factor_enabled boolean DEFAULT false,
    created_by integer,
    updated_by integer,
    updated_at timestamp without time zone,
    CONSTRAINT users_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying, 'Prefer not to say'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['patient'::character varying, 'doctor'::character varying, 'nurse'::character varying, 'admin'::character varying, 'billing_staff'::character varying, 'receptionist'::character varying])::text[])))
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    18747    users_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.users_user_id_seq;
       public               postgres    false    219            �           0    0    users_user_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;
          public               postgres    false    218            B           2604    19031    appointments appointment_id    DEFAULT     �   ALTER TABLE ONLY public.appointments ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);
 J   ALTER TABLE public.appointments ALTER COLUMN appointment_id DROP DEFAULT;
       public               postgres    false    251    250    251            ;           2604    18999    billingaddresses address_id    DEFAULT     �   ALTER TABLE ONLY public.billingaddresses ALTER COLUMN address_id SET DEFAULT nextval('public.billingaddresses_address_id_seq'::regclass);
 J   ALTER TABLE public.billingaddresses ALTER COLUMN address_id DROP DEFAULT;
       public               postgres    false    247    246    247            [           2604    19189    billingitems item_id    DEFAULT     |   ALTER TABLE ONLY public.billingitems ALTER COLUMN item_id SET DEFAULT nextval('public.billingitems_item_id_seq'::regclass);
 C   ALTER TABLE public.billingitems ALTER COLUMN item_id DROP DEFAULT;
       public               postgres    false    263    264    264            P           2604    19152    billings billing_id    DEFAULT     z   ALTER TABLE ONLY public.billings ALTER COLUMN billing_id SET DEFAULT nextval('public.billings_billing_id_seq'::regclass);
 B   ALTER TABLE public.billings ALTER COLUMN billing_id DROP DEFAULT;
       public               postgres    false    262    261    262            6           2604    18983 &   communicationpreferences preference_id    DEFAULT     �   ALTER TABLE ONLY public.communicationpreferences ALTER COLUMN preference_id SET DEFAULT nextval('public.communicationpreferences_preference_id_seq'::regclass);
 U   ALTER TABLE public.communicationpreferences ALTER COLUMN preference_id DROP DEFAULT;
       public               postgres    false    244    245    245            %           2604    18867 )   doctorhospitalaffiliations affiliation_id    DEFAULT     �   ALTER TABLE ONLY public.doctorhospitalaffiliations ALTER COLUMN affiliation_id SET DEFAULT nextval('public.doctorhospitalaffiliations_affiliation_id_seq'::regclass);
 X   ALTER TABLE public.doctorhospitalaffiliations ALTER COLUMN affiliation_id DROP DEFAULT;
       public               postgres    false    231    230    231                       2604    18820 %   doctorqualifications qualification_id    DEFAULT     �   ALTER TABLE ONLY public.doctorqualifications ALTER COLUMN qualification_id SET DEFAULT nextval('public.doctorqualifications_qualification_id_seq'::regclass);
 T   ALTER TABLE public.doctorqualifications ALTER COLUMN qualification_id DROP DEFAULT;
       public               postgres    false    225    224    225            (           2604    18881    doctorratings rating_id    DEFAULT     �   ALTER TABLE ONLY public.doctorratings ALTER COLUMN rating_id SET DEFAULT nextval('public.doctorratings_rating_id_seq'::regclass);
 F   ALTER TABLE public.doctorratings ALTER COLUMN rating_id DROP DEFAULT;
       public               postgres    false    232    233    233                       2604    18796    doctors doctor_id    DEFAULT     v   ALTER TABLE ONLY public.doctors ALTER COLUMN doctor_id SET DEFAULT nextval('public.doctors_doctor_id_seq'::regclass);
 @   ALTER TABLE public.doctors ALTER COLUMN doctor_id DROP DEFAULT;
       public               postgres    false    223    222    223                       2604    18833     doctorworkingdays working_day_id    DEFAULT     �   ALTER TABLE ONLY public.doctorworkingdays ALTER COLUMN working_day_id SET DEFAULT nextval('public.doctorworkingdays_working_day_id_seq'::regclass);
 O   ALTER TABLE public.doctorworkingdays ALTER COLUMN working_day_id DROP DEFAULT;
       public               postgres    false    227    226    227            3           2604    18969    emergencycontacts contact_id    DEFAULT     �   ALTER TABLE ONLY public.emergencycontacts ALTER COLUMN contact_id SET DEFAULT nextval('public.emergencycontacts_contact_id_seq'::regclass);
 K   ALTER TABLE public.emergencycontacts ALTER COLUMN contact_id DROP DEFAULT;
       public               postgres    false    243    242    243            N           2604    19132    emraccesslog access_id    DEFAULT     �   ALTER TABLE ONLY public.emraccesslog ALTER COLUMN access_id SET DEFAULT nextval('public.emraccesslog_access_id_seq'::regclass);
 E   ALTER TABLE public.emraccesslog ALTER COLUMN access_id DROP DEFAULT;
       public               postgres    false    259    260    260            K           2604    19093    emrfiles file_id    DEFAULT     t   ALTER TABLE ONLY public.emrfiles ALTER COLUMN file_id SET DEFAULT nextval('public.emrfiles_file_id_seq'::regclass);
 ?   ALTER TABLE public.emrfiles ALTER COLUMN file_id DROP DEFAULT;
       public               postgres    false    255    254    255            F           2604    19069    emrrecords record_id    DEFAULT     |   ALTER TABLE ONLY public.emrrecords ALTER COLUMN record_id SET DEFAULT nextval('public.emrrecords_record_id_seq'::regclass);
 C   ALTER TABLE public.emrrecords ALTER COLUMN record_id DROP DEFAULT;
       public               postgres    false    252    253    253            M           2604    19108    emrtags tag_id    DEFAULT     p   ALTER TABLE ONLY public.emrtags ALTER COLUMN tag_id SET DEFAULT nextval('public.emrtags_tag_id_seq'::regclass);
 =   ALTER TABLE public.emrtags ALTER COLUMN tag_id DROP DEFAULT;
       public               postgres    false    257    256    257            a           2604    19208    insuranceclaims claim_id    DEFAULT     �   ALTER TABLE ONLY public.insuranceclaims ALTER COLUMN claim_id SET DEFAULT nextval('public.insuranceclaims_claim_id_seq'::regclass);
 G   ALTER TABLE public.insuranceclaims ALTER COLUMN claim_id DROP DEFAULT;
       public               postgres    false    266    265    266            1           2604    18956    insuranceproviders insurance_id    DEFAULT     �   ALTER TABLE ONLY public.insuranceproviders ALTER COLUMN insurance_id SET DEFAULT nextval('public.insuranceproviders_insurance_id_seq'::regclass);
 N   ALTER TABLE public.insuranceproviders ALTER COLUMN insurance_id DROP DEFAULT;
       public               postgres    false    240    241    241            +           2604    18905    patientallergies allergy_id    DEFAULT     �   ALTER TABLE ONLY public.patientallergies ALTER COLUMN allergy_id SET DEFAULT nextval('public.patientallergies_allergy_id_seq'::regclass);
 J   ALTER TABLE public.patientallergies ALTER COLUMN allergy_id DROP DEFAULT;
       public               postgres    false    235    234    235            -           2604    18921 %   patientchronicconditions condition_id    DEFAULT     �   ALTER TABLE ONLY public.patientchronicconditions ALTER COLUMN condition_id SET DEFAULT nextval('public.patientchronicconditions_condition_id_seq'::regclass);
 T   ALTER TABLE public.patientchronicconditions ALTER COLUMN condition_id DROP DEFAULT;
       public               postgres    false    236    237    237            /           2604    18936     patientmedications medication_id    DEFAULT     �   ALTER TABLE ONLY public.patientmedications ALTER COLUMN medication_id SET DEFAULT nextval('public.patientmedications_medication_id_seq'::regclass);
 O   ALTER TABLE public.patientmedications ALTER COLUMN medication_id DROP DEFAULT;
       public               postgres    false    238    239    239                       2604    18781    patients patient_id    DEFAULT     z   ALTER TABLE ONLY public.patients ALTER COLUMN patient_id SET DEFAULT nextval('public.patients_patient_id_seq'::regclass);
 B   ALTER TABLE public.patients ALTER COLUMN patient_id DROP DEFAULT;
       public               postgres    false    220    221    221            >           2604    19013     paymentmethods payment_method_id    DEFAULT     �   ALTER TABLE ONLY public.paymentmethods ALTER COLUMN payment_method_id SET DEFAULT nextval('public.paymentmethods_payment_method_id_seq'::regclass);
 O   ALTER TABLE public.paymentmethods ALTER COLUMN payment_method_id DROP DEFAULT;
       public               postgres    false    248    249    249            e           2604    19227    paymenttransactions payment_id    DEFAULT     �   ALTER TABLE ONLY public.paymenttransactions ALTER COLUMN payment_id SET DEFAULT nextval('public.paymenttransactions_payment_id_seq'::regclass);
 M   ALTER TABLE public.paymenttransactions ALTER COLUMN payment_id DROP DEFAULT;
       public               postgres    false    268    267    268            !           2604    18850    time_slots slot_id    DEFAULT     x   ALTER TABLE ONLY public.time_slots ALTER COLUMN slot_id SET DEFAULT nextval('public.time_slots_slot_id_seq'::regclass);
 A   ALTER TABLE public.time_slots ALTER COLUMN slot_id DROP DEFAULT;
       public               postgres    false    228    229    229                       2604    18751    users user_id    DEFAULT     n   ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);
 <   ALTER TABLE public.users ALTER COLUMN user_id DROP DEFAULT;
       public               postgres    false    219    218    219            �          0    19028    appointments 
   TABLE DATA           �   COPY public.appointments (appointment_id, patient_id, slot_id, patient_name, phone_number, doctor_name, appointment_date, appointment_time, status, reason, notes, diagnosis, follow_up_date, created_by, updated_by, created_at, updated_at) FROM stdin;
    public               postgres    false    251   �m      �          0    18996    billingaddresses 
   TABLE DATA           �   COPY public.billingaddresses (address_id, patient_id, street, city, state, zip_code, country, is_default, created_at) FROM stdin;
    public               postgres    false    247   q      �          0    19186    billingitems 
   TABLE DATA           y   COPY public.billingitems (item_id, billing_id, description, quantity, unit_price, tax, discount, created_at) FROM stdin;
    public               postgres    false    264   �r      �          0    19149    billings 
   TABLE DATA           �   COPY public.billings (billing_id, patient_id, appointment_id, invoice_number, date_issued, due_date, subtotal, tax, discount, total, amount_paid, status, payment_method, payment_details, notes, created_by, created_at, updated_at) FROM stdin;
    public               postgres    false    262   �r      �          0    18980    communicationpreferences 
   TABLE DATA           �   COPY public.communicationpreferences (preference_id, patient_id, email_notifications, sms_notifications, phone_notifications, updated_at) FROM stdin;
    public               postgres    false    245   �r      �          0    18864    doctorhospitalaffiliations 
   TABLE DATA           �   COPY public.doctorhospitalaffiliations (affiliation_id, doctor_id, hospital_name, "position", start_date, end_date, is_current, created_at) FROM stdin;
    public               postgres    false    231   =s      �          0    18817    doctorqualifications 
   TABLE DATA           �   COPY public.doctorqualifications (qualification_id, doctor_id, qualification, institution, year_obtained, created_at) FROM stdin;
    public               postgres    false    225   Lv      �          0    18878    doctorratings 
   TABLE DATA           r   COPY public.doctorratings (rating_id, doctor_id, patient_id, rating, review, rating_date, created_at) FROM stdin;
    public               postgres    false    233   �y      �          0    18793    doctors 
   TABLE DATA           �   COPY public.doctors (doctor_id, user_id, license_number, specialization, years_of_experience, bio, department, average_consultation_time, average_rating, emr_access_level, created_at, updated_at) FROM stdin;
    public               postgres    false    223   �y      �          0    18830    doctorworkingdays 
   TABLE DATA           y   COPY public.doctorworkingdays (working_day_id, doctor_id, day, start_time, end_time, is_working, created_at) FROM stdin;
    public               postgres    false    227   �{      �          0    18966    emergencycontacts 
   TABLE DATA           }   COPY public.emergencycontacts (contact_id, patient_id, name, relationship, phone, email, is_primary, created_at) FROM stdin;
    public               postgres    false    243   �}      �          0    19129    emraccesslog 
   TABLE DATA           s   COPY public.emraccesslog (access_id, record_id, user_id, access_time, purpose, ip_address, user_agent) FROM stdin;
    public               postgres    false    260   8      �          0    19090    emrfiles 
   TABLE DATA           x   COPY public.emrfiles (file_id, record_id, file_name, file_url, file_type, upload_date, file_size, checksum) FROM stdin;
    public               postgres    false    255   �      �          0    19066 
   emrrecords 
   TABLE DATA           �   COPY public.emrrecords (record_id, patient_id, created_by, record_type, record_date, title, description, is_sensitive, created_at, updated_at) FROM stdin;
    public               postgres    false    253   ւ      �          0    19113    emrrecordtags 
   TABLE DATA           :   COPY public.emrrecordtags (record_id, tag_id) FROM stdin;
    public               postgres    false    258   ̄      �          0    19105    emrtags 
   TABLE DATA           3   COPY public.emrtags (tag_id, tag_name) FROM stdin;
    public               postgres    false    257   -�      �          0    19205    insuranceclaims 
   TABLE DATA           �   COPY public.insuranceclaims (claim_id, billing_id, is_claimed, claim_number, status, amount_covered, submitted_date, processed_date, notes, created_at) FROM stdin;
    public               postgres    false    266   ��      �          0    18953    insuranceproviders 
   TABLE DATA           �   COPY public.insuranceproviders (insurance_id, patient_id, name, policy_number, group_number, effective_date, expiration_date, primary_holder_name, primary_holder_relationship, created_at) FROM stdin;
    public               postgres    false    241   ׅ      �          0    18902    patientallergies 
   TABLE DATA           h   COPY public.patientallergies (allergy_id, patient_id, name, severity, reaction, created_at) FROM stdin;
    public               postgres    false    235   ̇      �          0    18918    patientchronicconditions 
   TABLE DATA              COPY public.patientchronicconditions (condition_id, patient_id, condition_name, diagnosed_date, notes, created_at) FROM stdin;
    public               postgres    false    237   0�      �          0    18933    patientmedications 
   TABLE DATA           �   COPY public.patientmedications (medication_id, patient_id, name, dosage, frequency, prescribed_by, start_date, end_date, notes, created_at) FROM stdin;
    public               postgres    false    239   ��      �          0    18778    patients 
   TABLE DATA           |   COPY public.patients (patient_id, user_id, blood_type, preferred_language, emr_access_token, emr_access_expiry) FROM stdin;
    public               postgres    false    221   ͌      �          0    19010    paymentmethods 
   TABLE DATA           z   COPY public.paymentmethods (payment_method_id, patient_id, type, details, is_default, created_at, updated_at) FROM stdin;
    public               postgres    false    249   U�      �          0    19224    paymenttransactions 
   TABLE DATA           �   COPY public.paymenttransactions (payment_id, billing_id, amount, payment_method, payment_details, transaction_date, processed_by, reference_number, status, notes, created_at) FROM stdin;
    public               postgres    false    268   ώ      �          0    18847 
   time_slots 
   TABLE DATA           t   COPY public.time_slots (slot_id, doctor_id, start_time, end_time, is_available, created_at, updated_at) FROM stdin;
    public               postgres    false    229   �      �          0    18748    users 
   TABLE DATA           Q  COPY public.users (user_id, first_name, last_name, date_of_birth, gender, phone, alternate_phone, email, street, city, state, zip_code, country, username, password_hash, role, is_active, last_login, account_created, profile_picture_url, email_verified, phone_verified, two_factor_enabled, created_by, updated_by, updated_at) FROM stdin;
    public               postgres    false    219   P�      �           0    0    appointments_appointment_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.appointments_appointment_id_seq', 371, true);
          public               postgres    false    250            �           0    0    billingaddresses_address_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.billingaddresses_address_id_seq', 650, true);
          public               postgres    false    246            �           0    0    billingitems_item_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.billingitems_item_id_seq', 1, false);
          public               postgres    false    263            �           0    0    billings_billing_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.billings_billing_id_seq', 1, false);
          public               postgres    false    261            �           0    0 *   communicationpreferences_preference_id_seq    SEQUENCE SET     Z   SELECT pg_catalog.setval('public.communicationpreferences_preference_id_seq', 650, true);
          public               postgres    false    244            �           0    0 -   doctorhospitalaffiliations_affiliation_id_seq    SEQUENCE SET     ^   SELECT pg_catalog.setval('public.doctorhospitalaffiliations_affiliation_id_seq', 1386, true);
          public               postgres    false    230            �           0    0 )   doctorqualifications_qualification_id_seq    SEQUENCE SET     Z   SELECT pg_catalog.setval('public.doctorqualifications_qualification_id_seq', 1980, true);
          public               postgres    false    224            �           0    0    doctorratings_rating_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.doctorratings_rating_id_seq', 1, false);
          public               postgres    false    232            �           0    0    doctors_doctor_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.doctors_doctor_id_seq', 1, false);
          public               postgres    false    222            �           0    0 $   doctorworkingdays_working_day_id_seq    SEQUENCE SET     U   SELECT pg_catalog.setval('public.doctorworkingdays_working_day_id_seq', 4620, true);
          public               postgres    false    226            �           0    0     emergencycontacts_contact_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.emergencycontacts_contact_id_seq', 650, true);
          public               postgres    false    242            �           0    0    emraccesslog_access_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.emraccesslog_access_id_seq', 160, true);
          public               postgres    false    259            �           0    0    emrfiles_file_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.emrfiles_file_id_seq', 339, true);
          public               postgres    false    254            �           0    0    emrrecords_record_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.emrrecords_record_id_seq', 180, true);
          public               postgres    false    252            �           0    0    emrtags_tag_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.emrtags_tag_id_seq', 1, false);
          public               postgres    false    256            �           0    0    insuranceclaims_claim_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.insuranceclaims_claim_id_seq', 1, false);
          public               postgres    false    265            �           0    0 #   insuranceproviders_insurance_id_seq    SEQUENCE SET     S   SELECT pg_catalog.setval('public.insuranceproviders_insurance_id_seq', 650, true);
          public               postgres    false    240            �           0    0    patientallergies_allergy_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.patientallergies_allergy_id_seq', 650, true);
          public               postgres    false    234            �           0    0 )   patientchronicconditions_condition_id_seq    SEQUENCE SET     Y   SELECT pg_catalog.setval('public.patientchronicconditions_condition_id_seq', 650, true);
          public               postgres    false    236            �           0    0 $   patientmedications_medication_id_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.patientmedications_medication_id_seq', 650, true);
          public               postgres    false    238            �           0    0    patients_patient_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.patients_patient_id_seq', 1, false);
          public               postgres    false    220            �           0    0 $   paymentmethods_payment_method_id_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.paymentmethods_payment_method_id_seq', 650, true);
          public               postgres    false    248            �           0    0 "   paymenttransactions_payment_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('public.paymenttransactions_payment_id_seq', 1, false);
          public               postgres    false    267            �           0    0    time_slots_slot_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.time_slots_slot_id_seq', 18146, true);
          public               postgres    false    228            �           0    0    users_user_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);
          public               postgres    false    218            �           2606    19039    appointments appointments_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);
 H   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_pkey;
       public                 postgres    false    251            �           2606    19041 %   appointments appointments_slot_id_key 
   CONSTRAINT     c   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_slot_id_key UNIQUE (slot_id);
 O   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_slot_id_key;
       public                 postgres    false    251            �           2606    19003 &   billingaddresses billingaddresses_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.billingaddresses
    ADD CONSTRAINT billingaddresses_pkey PRIMARY KEY (address_id);
 P   ALTER TABLE ONLY public.billingaddresses DROP CONSTRAINT billingaddresses_pkey;
       public                 postgres    false    247            �           2606    19198    billingitems billingitems_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.billingitems
    ADD CONSTRAINT billingitems_pkey PRIMARY KEY (item_id);
 H   ALTER TABLE ONLY public.billingitems DROP CONSTRAINT billingitems_pkey;
       public                 postgres    false    264            �           2606    19169 $   billings billings_invoice_number_key 
   CONSTRAINT     i   ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_invoice_number_key UNIQUE (invoice_number);
 N   ALTER TABLE ONLY public.billings DROP CONSTRAINT billings_invoice_number_key;
       public                 postgres    false    262            �           2606    19167    billings billings_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_pkey PRIMARY KEY (billing_id);
 @   ALTER TABLE ONLY public.billings DROP CONSTRAINT billings_pkey;
       public                 postgres    false    262            �           2606    18989 6   communicationpreferences communicationpreferences_pkey 
   CONSTRAINT        ALTER TABLE ONLY public.communicationpreferences
    ADD CONSTRAINT communicationpreferences_pkey PRIMARY KEY (preference_id);
 `   ALTER TABLE ONLY public.communicationpreferences DROP CONSTRAINT communicationpreferences_pkey;
       public                 postgres    false    245            �           2606    18871 :   doctorhospitalaffiliations doctorhospitalaffiliations_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY public.doctorhospitalaffiliations
    ADD CONSTRAINT doctorhospitalaffiliations_pkey PRIMARY KEY (affiliation_id);
 d   ALTER TABLE ONLY public.doctorhospitalaffiliations DROP CONSTRAINT doctorhospitalaffiliations_pkey;
       public                 postgres    false    231            �           2606    18823 .   doctorqualifications doctorqualifications_pkey 
   CONSTRAINT     z   ALTER TABLE ONLY public.doctorqualifications
    ADD CONSTRAINT doctorqualifications_pkey PRIMARY KEY (qualification_id);
 X   ALTER TABLE ONLY public.doctorqualifications DROP CONSTRAINT doctorqualifications_pkey;
       public                 postgres    false    225            �           2606    18890 4   doctorratings doctorratings_doctor_id_patient_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.doctorratings
    ADD CONSTRAINT doctorratings_doctor_id_patient_id_key UNIQUE (doctor_id, patient_id);
 ^   ALTER TABLE ONLY public.doctorratings DROP CONSTRAINT doctorratings_doctor_id_patient_id_key;
       public                 postgres    false    233    233            �           2606    18888     doctorratings doctorratings_pkey 
   CONSTRAINT     e   ALTER TABLE ONLY public.doctorratings
    ADD CONSTRAINT doctorratings_pkey PRIMARY KEY (rating_id);
 J   ALTER TABLE ONLY public.doctorratings DROP CONSTRAINT doctorratings_pkey;
       public                 postgres    false    233            �           2606    18810 "   doctors doctors_license_number_key 
   CONSTRAINT     g   ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_license_number_key UNIQUE (license_number);
 L   ALTER TABLE ONLY public.doctors DROP CONSTRAINT doctors_license_number_key;
       public                 postgres    false    223            �           2606    18806    doctors doctors_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (doctor_id);
 >   ALTER TABLE ONLY public.doctors DROP CONSTRAINT doctors_pkey;
       public                 postgres    false    223            �           2606    18808    doctors doctors_user_id_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_key UNIQUE (user_id);
 E   ALTER TABLE ONLY public.doctors DROP CONSTRAINT doctors_user_id_key;
       public                 postgres    false    223            �           2606    18840 5   doctorworkingdays doctorworkingdays_doctor_id_day_key 
   CONSTRAINT     z   ALTER TABLE ONLY public.doctorworkingdays
    ADD CONSTRAINT doctorworkingdays_doctor_id_day_key UNIQUE (doctor_id, day);
 _   ALTER TABLE ONLY public.doctorworkingdays DROP CONSTRAINT doctorworkingdays_doctor_id_day_key;
       public                 postgres    false    227    227            �           2606    18838 (   doctorworkingdays doctorworkingdays_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.doctorworkingdays
    ADD CONSTRAINT doctorworkingdays_pkey PRIMARY KEY (working_day_id);
 R   ALTER TABLE ONLY public.doctorworkingdays DROP CONSTRAINT doctorworkingdays_pkey;
       public                 postgres    false    227            �           2606    18973 (   emergencycontacts emergencycontacts_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.emergencycontacts
    ADD CONSTRAINT emergencycontacts_pkey PRIMARY KEY (contact_id);
 R   ALTER TABLE ONLY public.emergencycontacts DROP CONSTRAINT emergencycontacts_pkey;
       public                 postgres    false    243            �           2606    19137    emraccesslog emraccesslog_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY public.emraccesslog
    ADD CONSTRAINT emraccesslog_pkey PRIMARY KEY (access_id);
 H   ALTER TABLE ONLY public.emraccesslog DROP CONSTRAINT emraccesslog_pkey;
       public                 postgres    false    260            �           2606    19098    emrfiles emrfiles_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.emrfiles
    ADD CONSTRAINT emrfiles_pkey PRIMARY KEY (file_id);
 @   ALTER TABLE ONLY public.emrfiles DROP CONSTRAINT emrfiles_pkey;
       public                 postgres    false    255            �           2606    19078    emrrecords emrrecords_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.emrrecords
    ADD CONSTRAINT emrrecords_pkey PRIMARY KEY (record_id);
 D   ALTER TABLE ONLY public.emrrecords DROP CONSTRAINT emrrecords_pkey;
       public                 postgres    false    253            �           2606    19117     emrrecordtags emrrecordtags_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY public.emrrecordtags
    ADD CONSTRAINT emrrecordtags_pkey PRIMARY KEY (record_id, tag_id);
 J   ALTER TABLE ONLY public.emrrecordtags DROP CONSTRAINT emrrecordtags_pkey;
       public                 postgres    false    258    258            �           2606    19110    emrtags emrtags_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.emrtags
    ADD CONSTRAINT emrtags_pkey PRIMARY KEY (tag_id);
 >   ALTER TABLE ONLY public.emrtags DROP CONSTRAINT emrtags_pkey;
       public                 postgres    false    257            �           2606    19112    emrtags emrtags_tag_name_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.emrtags
    ADD CONSTRAINT emrtags_tag_name_key UNIQUE (tag_name);
 F   ALTER TABLE ONLY public.emrtags DROP CONSTRAINT emrtags_tag_name_key;
       public                 postgres    false    257            �           2606    19217 .   insuranceclaims insuranceclaims_billing_id_key 
   CONSTRAINT     o   ALTER TABLE ONLY public.insuranceclaims
    ADD CONSTRAINT insuranceclaims_billing_id_key UNIQUE (billing_id);
 X   ALTER TABLE ONLY public.insuranceclaims DROP CONSTRAINT insuranceclaims_billing_id_key;
       public                 postgres    false    266            �           2606    19215 $   insuranceclaims insuranceclaims_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.insuranceclaims
    ADD CONSTRAINT insuranceclaims_pkey PRIMARY KEY (claim_id);
 N   ALTER TABLE ONLY public.insuranceclaims DROP CONSTRAINT insuranceclaims_pkey;
       public                 postgres    false    266            �           2606    18959 *   insuranceproviders insuranceproviders_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.insuranceproviders
    ADD CONSTRAINT insuranceproviders_pkey PRIMARY KEY (insurance_id);
 T   ALTER TABLE ONLY public.insuranceproviders DROP CONSTRAINT insuranceproviders_pkey;
       public                 postgres    false    241            �           2606    18911 &   patientallergies patientallergies_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.patientallergies
    ADD CONSTRAINT patientallergies_pkey PRIMARY KEY (allergy_id);
 P   ALTER TABLE ONLY public.patientallergies DROP CONSTRAINT patientallergies_pkey;
       public                 postgres    false    235            �           2606    18926 6   patientchronicconditions patientchronicconditions_pkey 
   CONSTRAINT     ~   ALTER TABLE ONLY public.patientchronicconditions
    ADD CONSTRAINT patientchronicconditions_pkey PRIMARY KEY (condition_id);
 `   ALTER TABLE ONLY public.patientchronicconditions DROP CONSTRAINT patientchronicconditions_pkey;
       public                 postgres    false    237            �           2606    18941 *   patientmedications patientmedications_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.patientmedications
    ADD CONSTRAINT patientmedications_pkey PRIMARY KEY (medication_id);
 T   ALTER TABLE ONLY public.patientmedications DROP CONSTRAINT patientmedications_pkey;
       public                 postgres    false    239            ~           2606    18784    patients patients_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);
 @   ALTER TABLE ONLY public.patients DROP CONSTRAINT patients_pkey;
       public                 postgres    false    221            �           2606    18786    patients patients_user_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);
 G   ALTER TABLE ONLY public.patients DROP CONSTRAINT patients_user_id_key;
       public                 postgres    false    221            �           2606    19021 "   paymentmethods paymentmethods_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.paymentmethods
    ADD CONSTRAINT paymentmethods_pkey PRIMARY KEY (payment_method_id);
 L   ALTER TABLE ONLY public.paymentmethods DROP CONSTRAINT paymentmethods_pkey;
       public                 postgres    false    249            �           2606    19234 ,   paymenttransactions paymenttransactions_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.paymenttransactions
    ADD CONSTRAINT paymenttransactions_pkey PRIMARY KEY (payment_id);
 V   ALTER TABLE ONLY public.paymenttransactions DROP CONSTRAINT paymenttransactions_pkey;
       public                 postgres    false    268            �           2606    18857    time_slots time_slots_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (slot_id);
 D   ALTER TABLE ONLY public.time_slots DROP CONSTRAINT time_slots_pkey;
       public                 postgres    false    229            x           2606    18764    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    219            z           2606    18762    users users_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    219            |           2606    18766    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    219            �           1259    19249    idx_appointments_patient    INDEX     W   CREATE INDEX idx_appointments_patient ON public.appointments USING btree (patient_id);
 ,   DROP INDEX public.idx_appointments_patient;
       public                 postgres    false    251            �           1259    19250    idx_appointments_slot    INDEX     Q   CREATE INDEX idx_appointments_slot ON public.appointments USING btree (slot_id);
 )   DROP INDEX public.idx_appointments_slot;
       public                 postgres    false    251            �           1259    19252    idx_billings_patient    INDEX     O   CREATE INDEX idx_billings_patient ON public.billings USING btree (patient_id);
 (   DROP INDEX public.idx_billings_patient;
       public                 postgres    false    262            �           1259    19247    idx_doctors_specialty    INDEX     S   CREATE INDEX idx_doctors_specialty ON public.doctors USING btree (specialization);
 )   DROP INDEX public.idx_doctors_specialty;
       public                 postgres    false    223            �           1259    19246    idx_doctors_user    INDEX     G   CREATE INDEX idx_doctors_user ON public.doctors USING btree (user_id);
 $   DROP INDEX public.idx_doctors_user;
       public                 postgres    false    223            �           1259    19251    idx_records_patient    INDEX     P   CREATE INDEX idx_records_patient ON public.emrrecords USING btree (patient_id);
 '   DROP INDEX public.idx_records_patient;
       public                 postgres    false    253            �           1259    19248    idx_time_slots_doctor    INDEX     ]   CREATE INDEX idx_time_slots_doctor ON public.time_slots USING btree (doctor_id, start_time);
 )   DROP INDEX public.idx_time_slots_doctor;
       public                 postgres    false    229    229            v           1259    19245    idx_users_email    INDEX     B   CREATE INDEX idx_users_email ON public.users USING btree (email);
 #   DROP INDEX public.idx_users_email;
       public                 postgres    false    219            �           2620    19063 (   appointments trg_check_slot_availability    TRIGGER     �   CREATE TRIGGER trg_check_slot_availability BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.check_slot_availability();
 A   DROP TRIGGER trg_check_slot_availability ON public.appointments;
       public               postgres    false    279    251            �           2606    19052 )   appointments appointments_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);
 S   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_created_by_fkey;
       public               postgres    false    4986    219    251            �           2606    19042 )   appointments appointments_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 S   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_patient_id_fkey;
       public               postgres    false    221    251    4990            �           2606    19047 &   appointments appointments_slot_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.time_slots(slot_id);
 P   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_slot_id_fkey;
       public               postgres    false    251    229    5009            �           2606    19057 )   appointments appointments_updated_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(user_id);
 S   ALTER TABLE ONLY public.appointments DROP CONSTRAINT appointments_updated_by_fkey;
       public               postgres    false    4986    219    251            �           2606    19004 1   billingaddresses billingaddresses_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.billingaddresses
    ADD CONSTRAINT billingaddresses_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 [   ALTER TABLE ONLY public.billingaddresses DROP CONSTRAINT billingaddresses_patient_id_fkey;
       public               postgres    false    221    247    4990            �           2606    19199 )   billingitems billingitems_billing_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.billingitems
    ADD CONSTRAINT billingitems_billing_id_fkey FOREIGN KEY (billing_id) REFERENCES public.billings(billing_id);
 S   ALTER TABLE ONLY public.billingitems DROP CONSTRAINT billingitems_billing_id_fkey;
       public               postgres    false    262    5054    264            �           2606    19175 %   billings billings_appointment_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(appointment_id);
 O   ALTER TABLE ONLY public.billings DROP CONSTRAINT billings_appointment_id_fkey;
       public               postgres    false    262    251    5033            �           2606    19180 !   billings billings_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);
 K   ALTER TABLE ONLY public.billings DROP CONSTRAINT billings_created_by_fkey;
       public               postgres    false    219    4986    262            �           2606    19170 !   billings billings_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 K   ALTER TABLE ONLY public.billings DROP CONSTRAINT billings_patient_id_fkey;
       public               postgres    false    4990    221    262            �           2606    18990 A   communicationpreferences communicationpreferences_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.communicationpreferences
    ADD CONSTRAINT communicationpreferences_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 k   ALTER TABLE ONLY public.communicationpreferences DROP CONSTRAINT communicationpreferences_patient_id_fkey;
       public               postgres    false    245    221    4990            �           2606    18872 D   doctorhospitalaffiliations doctorhospitalaffiliations_doctor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.doctorhospitalaffiliations
    ADD CONSTRAINT doctorhospitalaffiliations_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);
 n   ALTER TABLE ONLY public.doctorhospitalaffiliations DROP CONSTRAINT doctorhospitalaffiliations_doctor_id_fkey;
       public               postgres    false    231    4996    223            �           2606    18824 8   doctorqualifications doctorqualifications_doctor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.doctorqualifications
    ADD CONSTRAINT doctorqualifications_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);
 b   ALTER TABLE ONLY public.doctorqualifications DROP CONSTRAINT doctorqualifications_doctor_id_fkey;
       public               postgres    false    223    225    4996            �           2606    18891 *   doctorratings doctorratings_doctor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.doctorratings
    ADD CONSTRAINT doctorratings_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);
 T   ALTER TABLE ONLY public.doctorratings DROP CONSTRAINT doctorratings_doctor_id_fkey;
       public               postgres    false    233    223    4996            �           2606    18896 +   doctorratings doctorratings_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.doctorratings
    ADD CONSTRAINT doctorratings_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 U   ALTER TABLE ONLY public.doctorratings DROP CONSTRAINT doctorratings_patient_id_fkey;
       public               postgres    false    4990    233    221            �           2606    18811    doctors doctors_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 F   ALTER TABLE ONLY public.doctors DROP CONSTRAINT doctors_user_id_fkey;
       public               postgres    false    4986    223    219            �           2606    18841 2   doctorworkingdays doctorworkingdays_doctor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.doctorworkingdays
    ADD CONSTRAINT doctorworkingdays_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id);
 \   ALTER TABLE ONLY public.doctorworkingdays DROP CONSTRAINT doctorworkingdays_doctor_id_fkey;
       public               postgres    false    223    4996    227            �           2606    18974 3   emergencycontacts emergencycontacts_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emergencycontacts
    ADD CONSTRAINT emergencycontacts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 ]   ALTER TABLE ONLY public.emergencycontacts DROP CONSTRAINT emergencycontacts_patient_id_fkey;
       public               postgres    false    243    221    4990            �           2606    19138 (   emraccesslog emraccesslog_record_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emraccesslog
    ADD CONSTRAINT emraccesslog_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.emrrecords(record_id);
 R   ALTER TABLE ONLY public.emraccesslog DROP CONSTRAINT emraccesslog_record_id_fkey;
       public               postgres    false    253    260    5039            �           2606    19143 &   emraccesslog emraccesslog_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emraccesslog
    ADD CONSTRAINT emraccesslog_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 P   ALTER TABLE ONLY public.emraccesslog DROP CONSTRAINT emraccesslog_user_id_fkey;
       public               postgres    false    4986    260    219            �           2606    19099     emrfiles emrfiles_record_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emrfiles
    ADD CONSTRAINT emrfiles_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.emrrecords(record_id);
 J   ALTER TABLE ONLY public.emrfiles DROP CONSTRAINT emrfiles_record_id_fkey;
       public               postgres    false    253    255    5039            �           2606    19084 %   emrrecords emrrecords_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emrrecords
    ADD CONSTRAINT emrrecords_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);
 O   ALTER TABLE ONLY public.emrrecords DROP CONSTRAINT emrrecords_created_by_fkey;
       public               postgres    false    253    219    4986            �           2606    19079 %   emrrecords emrrecords_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emrrecords
    ADD CONSTRAINT emrrecords_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 O   ALTER TABLE ONLY public.emrrecords DROP CONSTRAINT emrrecords_patient_id_fkey;
       public               postgres    false    253    221    4990            �           2606    19118 *   emrrecordtags emrrecordtags_record_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emrrecordtags
    ADD CONSTRAINT emrrecordtags_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.emrrecords(record_id);
 T   ALTER TABLE ONLY public.emrrecordtags DROP CONSTRAINT emrrecordtags_record_id_fkey;
       public               postgres    false    5039    258    253            �           2606    19123 '   emrrecordtags emrrecordtags_tag_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.emrrecordtags
    ADD CONSTRAINT emrrecordtags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.emrtags(tag_id);
 Q   ALTER TABLE ONLY public.emrrecordtags DROP CONSTRAINT emrrecordtags_tag_id_fkey;
       public               postgres    false    5044    257    258            �           2606    19218 /   insuranceclaims insuranceclaims_billing_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.insuranceclaims
    ADD CONSTRAINT insuranceclaims_billing_id_fkey FOREIGN KEY (billing_id) REFERENCES public.billings(billing_id);
 Y   ALTER TABLE ONLY public.insuranceclaims DROP CONSTRAINT insuranceclaims_billing_id_fkey;
       public               postgres    false    262    266    5054            �           2606    18960 5   insuranceproviders insuranceproviders_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.insuranceproviders
    ADD CONSTRAINT insuranceproviders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 _   ALTER TABLE ONLY public.insuranceproviders DROP CONSTRAINT insuranceproviders_patient_id_fkey;
       public               postgres    false    221    4990    241            �           2606    18912 1   patientallergies patientallergies_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.patientallergies
    ADD CONSTRAINT patientallergies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 [   ALTER TABLE ONLY public.patientallergies DROP CONSTRAINT patientallergies_patient_id_fkey;
       public               postgres    false    235    4990    221            �           2606    18927 A   patientchronicconditions patientchronicconditions_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.patientchronicconditions
    ADD CONSTRAINT patientchronicconditions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 k   ALTER TABLE ONLY public.patientchronicconditions DROP CONSTRAINT patientchronicconditions_patient_id_fkey;
       public               postgres    false    4990    237    221            �           2606    18942 5   patientmedications patientmedications_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.patientmedications
    ADD CONSTRAINT patientmedications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 _   ALTER TABLE ONLY public.patientmedications DROP CONSTRAINT patientmedications_patient_id_fkey;
       public               postgres    false    221    239    4990            �           2606    18947 8   patientmedications patientmedications_prescribed_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.patientmedications
    ADD CONSTRAINT patientmedications_prescribed_by_fkey FOREIGN KEY (prescribed_by) REFERENCES public.doctors(doctor_id);
 b   ALTER TABLE ONLY public.patientmedications DROP CONSTRAINT patientmedications_prescribed_by_fkey;
       public               postgres    false    239    4996    223            �           2606    18787    patients patients_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 H   ALTER TABLE ONLY public.patients DROP CONSTRAINT patients_user_id_fkey;
       public               postgres    false    221    219    4986            �           2606    19022 -   paymentmethods paymentmethods_patient_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.paymentmethods
    ADD CONSTRAINT paymentmethods_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id);
 W   ALTER TABLE ONLY public.paymentmethods DROP CONSTRAINT paymentmethods_patient_id_fkey;
       public               postgres    false    249    221    4990            �           2606    19235 7   paymenttransactions paymenttransactions_billing_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.paymenttransactions
    ADD CONSTRAINT paymenttransactions_billing_id_fkey FOREIGN KEY (billing_id) REFERENCES public.billings(billing_id);
 a   ALTER TABLE ONLY public.paymenttransactions DROP CONSTRAINT paymenttransactions_billing_id_fkey;
       public               postgres    false    268    5054    262            �           2606    19240 9   paymenttransactions paymenttransactions_processed_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.paymenttransactions
    ADD CONSTRAINT paymenttransactions_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(user_id);
 c   ALTER TABLE ONLY public.paymenttransactions DROP CONSTRAINT paymenttransactions_processed_by_fkey;
       public               postgres    false    219    268    4986            �           2606    18858 $   time_slots time_slots_doctor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(doctor_id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.time_slots DROP CONSTRAINT time_slots_doctor_id_fkey;
       public               postgres    false    223    229    4996            �           2606    18767    users users_created_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);
 E   ALTER TABLE ONLY public.users DROP CONSTRAINT users_created_by_fkey;
       public               postgres    false    4986    219    219            �           2606    18772    users users_updated_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(user_id);
 E   ALTER TABLE ONLY public.users DROP CONSTRAINT users_updated_by_fkey;
       public               postgres    false    219    219    4986            �   #  x����N�0���S��r�᎓�e�E-�n�δ��ؕ�����q��^lժU������ge��ܘZ�e#}͊���4�򢜰K{�f���g���Ʊ4�՘*X<��1}�0�N�Ǌ]��$~Q��F�-p�*�|m�2o����J!Ó��Jzi���$윰��p]Dq%3�d�l2/��2��t������X�2�5d��Xi�GD5�����A��J���l �ki"z��Ѡ�~dz������A��r��߂���9	/؝5���ּ�ҳ��H����X��3��(~�h����1R{� R������X��V#�]X�M��-����2�bsK�r6a7��/��,䬈P��V: �UVnZ|i�,ɇV8Qc�*�Yn��p5?�h���=?FkIU���*8��rKDJ�N�P������Y�A�����Z�̆�?s���P���
��+�:�?�v���a�#iL����0r4���k��5X!�##3E�vdw`%�k��A}j�>I>,���ؒ�!��1�M�j����S�0e��lB$�KMy("��CXz|E�a��	h��B�@����{�ӹ;���z�+�^K�*�gg���W�hQJ��T5cd��J]?�ڃ��la���/��t�c�S��X\JX��~z!����ɓ��A#f8��I&��Z�N&�3����,L֯}����������qt&(�ת�3&!����2�])�&��C��Ea��Z�_P���<ׯ'���3�Iv^��Z��Psz��~9=99���      �   i  x����n�0����p �%�f'@�����^�a*�逢`���Jz�! � Oˏ;�cM)�i��z�='<L�x`ωG��Trj�����P�j��Y�+���n/}a�V�[X��`�p��o7��MUF�а-��vCp�n�Fܾ�.�{<��qϑ�T�2��A���7��Y�fƄSr��9�A�V�]�A#f��L�|pt5�wܝ�AX������@+��
���І�S�=�St��X�UՖ�Z���nN�<������Og��̉��{7z(e��p9:�=y�B�y<�3]��|��P�
R�Ùӛ˸�.F��3�9��;g�l%�0�a4��Q�z��������L�bc��ה��\,��zѵ      �      x������ � �      �      x������ � �      �   e   x����� ߦ�4@Ğ��
�_A�E��<�+�0W^pa�E3��dH&��0������L �)�����`'���VQO.4��`�@jT�ϝR� ��K�      �   �  x����n�0���S�H'�ޥ�K�]ڪ��Ro�/�F��]�~����M$����9s��8&��뵐���^�T��6P���r+,�!�U�� �r���L.�ԫ	|�{~����=��A��#��)/��2
/�Q逅q���XQ~->�JhC'Z����\-W8�Xt�D^��F���PJ���h�7D�'��?���@�Ic�l���5��k.�3j��7}}pJ"W�W�<��_:������/Haw-i����}�>�����.M	#!��� ��K�)>�%"�tZ�je`s�hl���o<�Yq�)����� a��|s���T�J7���'��Gj��љaM
�ԩ1��ـm�����NF��=��;e�Q`�VN�����	Z~js�à�~6O"�LJ$���VX�s?1�t�\-y��'��9����xe�+�D?u��!1F.2l�� �N��C~M�wINHL�A����27�Z�onw97���=�'�X���;S����"��B��V�`��f����c^�-mL�s�-�m4>Ur�U˙��~/1���[���7�7�~JI;��-%e$%����ݳ{-�`��@nT��F�6r��$p�?=7�\qXIގ�#�%���[����ϱG=6.��X�-�V������Mq/��.�>����3�'�{�����ޖ����K��ӊ�?����0 aC���͏i�-p��Mcg�~�b��|��͎�D5�v������];�F�v1�j�o;      �   M  x���Ao�8��̯�iOn`I�d���Yg�(1�n��2�X�E
�������@��fP�ŀ/ߛy|3� ��|�`+i���؅R�/]I���I�;��w��J��xQJ�K�M�R�Z�p:��'�?Mg�����(�G��,
��Y��!j,���t��,T= �]���/�I�9�?�N�-�	_��_n��$�x�#j��`7Ro�J�ok�$l'�n�o��Q�gbN=�ɲ�M焳���|�Ӣ��vՎ_S�z��0J���6���$C���|U������=,���)�2�]-[.5�Z�;�`O�Z����k���Z�@Mx�Ak�@���R�"��޺ڴ��X����Ƥ��d̢������
��<�q��|1R;rHA)����n,/ZQJ���d1;w��c�#�e�Ւ)�Qx��6���ɡ�����������uȊ����[b���l�i��X����Lꨇ	��}4dA�1<�XL��N��w7�'|�%��\����
�̓�$& �28�Bq��j�.'�7��ِ��j\#�5���4>�w��������}���}�5��ࣚp�7G�ᨼU��J<	e�af̎�j�*+�h��BmLo��F|�g,���{��?�v:E�q�.�����G�Lk��("��i���ȕ�Li�'?o�ŝF�w�K��ƨGp�g���V��q�#����e��
:g�K����,�4A���;ǓP�seh��pgp�=k5M	;|�`�ݼ3�9�h�h��t��!龶���cJ
� H�O�?(i6���BQ7�z]�s2��pk��%�v���������n4ʿ��������������      �      x������ � �      �   �  x���=o�0���+8u� ����&����P ��b-&%�T�ח&�TN�.*��w�{_+��o?/��,/�U-��?���p�"��\7dߠ�M�h.E���2+���h��bH�2�c���l�ˤ"	�a�MƢ<e����jA�:������7J4�@�'�����1wJ��������7�g���r�m4��j��s&O�`�L���(H
�XuG~��$��ѣ:�^:�d���Û��:�w��� Dl?Ja������ס�tˡ�Y�2��6|T��>�G�#{!��'��+{4F��f�1�ܱ���Φ��X��ʯ$J[�^�'�.3]|�W�yU/�p"b�ۮ�!�ґ�8��|�u#��{:��w���i<&�O��J\<���s��:v�B��d,�v������Ѽ,�5j�z.miB���:�g<Yds���z2 ����������#s��i�f4�;nx�duD�߿������)Z, ���Z      �   &  x��׽n1�Y~��@��u�f�@t� )���x�ۇL+��P�ݼ����&�+��������g :ܼ;����)<���B��t�1�c�wXrJ�PjM�?^�~�tf�������J_$���⌯��/�|xx�^|Go¯��:<>|��!��ŉQ�L�G����V2���>Jf���mX��13�Jf}�X�;K�5��e}�<82�]f֍��ef�%}v�����e�������G�Β��2�8xV%g��`4��z)���Uҗ�h�G��`4��x�y�Lǻpo�(ԥ��-����.3����.3�$�df��o]fą��ey�U�¯g�P�p�)/����2��ߺ˴�$}�)9�Q2�?�"�Y�-[9)	wv���#�*��������1�n���7F"ᾒ!@����M���.3��z�2�ϒ>���sg�!T�[����F�ޒ�@ލ�3�n��ڿ1bI_�2#�̝#��ؽ�c�%��>
�ɨ{��XE�G����ަ�_�^�>�.~7��$�=1��wU����pxu��      �   .  x����j�@E�ק�}��8�fՖPJCJ��U7_�!c�82j o_u�ւ����ơ���7b�ΐC^ۮQx��*K�8
e���_�����֠E���W"cB�e��$�<��0@�:�F���N�]�E��^,�F�7��;�*b{jU��m�r�� f x=_"ġ�82,פ'w���Ē����%�S�%l�;��wpn�c�ȩ:Ӎ��FxvKDhF���$xW�/�R����1��YR�"�(ٖjk^�oo2Q.yZ��jb��tk��@��lm�C�����`M�����fу?��y?�G��      �   �  x���_o� şɧ��˃1�@��i�2iҲE��aREm����n�}�A6���Y���lΏ{�5�%��a����삗X��(*�Umz#=��1��{��I��u���0Ŕ�t?�12���oڶ���5P���`sxl
�[�v*�&�	�0�dBy�N�7ȍ����k��Wk������\���W��z�ig�߷�S�b轔����9|��27���E�{��gS��k�u.O��P��{c���Iy�֍L0��X���	P�fe$�(i�`�� �6Gh����f`���@I#����=y�Fh�o�٪�q  z�uV��ru��)���՟��p�|�'�4}�tڨ�^PV��Q#�%���e^AZi�A��8�NJ��$b}RN������FI#��^�n�l���xWg�^DO���f���c!�� �>�;�L&?	�[      �   �  x����j�0���O�X�|�ޅ��@	�iK/
F++^o|B�ݷ�l��W��+!4�����@�������O�X=�i�ưG�u~�����!��d��r�F��%،c�X35C��;�T�0ߑ�a{����3Ju|�Z(	��e�#@�[;y�K_�O���y��G��&!.��t1
�GW��*�	��A��g���8ב0Vu�_����F�?�H�220�p׶�׷�S�G�5�u�9"L�f���C��U�� ��]�Pޅ�B�\������mQ("($���$|7�6��Cy0�Z�_护��wI�)����<�����v�_c$*0Y����j��[ ��aI��#���q�R���o��fcI��Du�?����-����n���]��[	�8x����[�8Ln����t�7�PR�9��б�g�e�o�Ԉ�      �   �  x��T�n�0<�_�?���#���i$��@���Ң),I'�ח���=T5�NZi0��a�����&``g�|6_Mg�iq��zqq�Z��/���ڠ��nwh���'��A}��il�C��;��^}b��h2W�`Ŷ�x�,Z��g���T�j��pC>�@�3�юV�Pm:�n�g��6�#��{�XQC6d���-���QC%��V���fO .�4Z�Re�~�/c�fmI�%���ڸ&��&�yG��YH^�e�y�+�qj�(�3�JX{O��6�P@6�D{��`ö'�b5x���*c�Z�+R�)k�Jx�4��ϿkrĒ�WSAlK�{�2N(ȦN{�/S�.	�-'�.U�9vl��K�qZ�n����r�տۮ݇k��>Vɵ���Je���;�A\J�i���vL�Io�s�z�۰�kp��b����R�t÷o@A�cK���C�t�L��].�k3�&���d2����Z      �   Q   x����0ߨ�����K��#�<V0H���v����-H(-�e��	��~����ZI39��V��/}�ȾB�}$}���      �   }   x�%��
�@���"/���V!�T6�y$�n��!y{��3LIUg*�aIWk�$��1�{�{��'k#6T���>l�ď��C�	;j�4j;bO����;Ѝ��rA�^ӧ�#�s +x*�      �      x������ � �      �   �  x���ˎ�0��'O�`��ّt:�r�ڮ�9������}�H��Z��2�O�9�I�Y)�mI���3X�*(>e��S��F�(e���`���&��
���Wa@e�R�ģ�C�I�y2�$���=�^zd���q��=ҢB�tG	��9!)����� `���<��/=�v�l�����sb�.c���c�ir�V�	@	�K�uCv]]��4;�l��s�Ceo�������'�)J�bB;�E����!�N1��zI���4q��3�Z��*[� � �\������v�z^�C��O8^�'�C]6���K�]տ�1İ^ڇl��74�{���v����q�Mv�&}��h	dǪ��dQ=N7[��cfǚ$cM��2�ٝR�/M3�()��Ƕjj��d��S{+f�i�I�M]j3s�����y�fH�Qث��v��d�;3�f���O�j�K�O`�?�]h�P�>�f�?�K�      �   T  x����n�0Eg�+�I?���@� E<t�ڴEđIN�~}iN7��DA���2KB��n���hZ�T��/rQRUQ�6���W�k��Q�\'�p'�xo�i�ʒ8��A�D��u^�ȣ��)�J��k�o����N`��@K'Q]��d��x1�j*�iH��g锐��}}�0�N�\�؎4t�� ���1��*��B��gEN�4����,���*��[ܳ��{s��� \a���~!����:����mSIq�m��5��v����:[زE�����F|2��Ta�z~+v����a~��Q�Z�r6�t�}cN���V�4�z˧T>VA� c��      �   �  x����n�0����0 �˾�v�^�{녑�Ң���}I+�@�w�qvf�R���uB�؁�+F��\\Vp�V�d{�Fq`ad�v����H6�V\�\n�,��z[OuY(լ�R���	�#�@.o�k�읍����ލ�u4����
؅8�:�*.%/��A���}�Pg�a��m���n	e���p��:
c�7��N����=�c#v��tYA/Σ���v>�"e!r�ņ�4�~6ڳi�&��^OW���L���jxޟ��R���	��C���9�{�P���5��H��K��沄���G�,D�!ܚ`t���q��m�������}�Ϟ�R�T6�U��|G�RNtJ���^9��|��r���I��C*����$��������*R�)Dt��.,���V\	�k��<�0O��m��ΟO�������      �   �  x����n�0����^��E�li� ���)-Y�ER�h��ӗ��	
u���(K8pXch�7�Bʘ���+$���)&e��>^a��H�:�Ġ��kJYByI�|��C*�Y"�(Y"@���\�{mҨ�fo�<󒲜
q�֖��q�j���� ���x�b[ա-T;x�E���|¤�s*ل�9 �b4�O�+=�<&�6����l�,g����uq��,AӇ��U��4�Kh]�xR!_޲:"�#EN�����/=4�~ET��yH�GG_�t��e�K#\ľ'ȳ����mE��j�&f=��c�?F����=��*�1񌲌�d�_��6C	j�aH�>�e��1�:נU�roC^7+��ۈjB�n��OL%���z�~�!a�g[^�.�&��-m=�}����R
O����|[�k	w���W�T�/����q�3���b�� �      �   x   x�e��
�@ E�g~E��^���~�� �D����i$8wu�/!q�h�4x��,c��	Y�R\��u���s��p�w?]n�1~q�r�]�P�bY:.�q�%*q��B�5��*�&��-�bc���2S      �   j  x���[O�0������޸�m�әh4��dB:hf#c��2b��Fg����O=mO���է�Jd�NR�2xwr^���e;�#v�T��x��Ԅ�֤nKa�ϲ��Ԁ=�F��FdL�1#�>%�,Y>ŀ!�?�#�bv�7���@��,�F�"�T��̄2��W�S{�<�{�M.�6)���w�չ�K(���0(оvDa��a��Z��B�� ��xKx�n���(f��bs����:�u���[Y��A>����E.W\�ξĳ;��"L�FC z��鑡�Y>Ia�ƻ#��L�b7�!��ω۩R����$� y�V,j���y��)��i��0��?�˥eY�hN�      �      x������ � �      �   T  x���M�G���c� (#�/��x�x�r���U�*y��ObT ����wo&`3���ˋ��}��[ɟ��o�gV>�����oV�����U�����f˩����>�N�?�tq����!N}p�g���~�	q��38)�xp�ם(Wg>��<2�a���m��pqn�6��[Tqns0��A4qns0�����a�đ�C��ę9����A����|�̟϶���\�:�ew�s�G� M��{�G��tqn�iyO��s��<2y����`=;2}wns����qt|<;�r�����ف}�!���ǳ���������d)�#��y���YL{p�>oY\p�>oY�8����~������N�~u�a��̼�ݹρ���)�m���8�9�3s������́�W�f(o���@y;��a�vZ���iM&��uq�|�6��|��yf���@98-�arpZ�����"�-g����M&o��8L�N��A<�u�ko�s��82���ar}�����S�ۼřy�����sw�s�G�q�� ��s��<2o��az��U��\瑹�M���z��N���ļq��"�G�>���}{�N����C��Vārp������C��VŁ�ik����i](���[�rc��0��B(g��:\��ew�����8P��.��z�Y����ŁrV������*g��9�͞�@ynq����>�r��ݡr֨�@9k4q��3�8P��}���昻C��0�9R�����Y�a�is�8�9m��>�d��uw�<7�8�����@�qqn������?8'�-ā΃g^.oGٝ��?�G�ār}�8P��*t�M�?�.��x��g�?�)�D��;G��ܿ�,�@��i�@�K���z���C�og�w���;9ā����@�Nn���C2w��)��"�S,�Ĺ�A���8���r�8���r�8H���mP��r��0��r�8H���9G_N���HQ�����_�u`=�r|w�~g9U��YN�]���A��������)��,'�Az��8H�ŋ8H��]��W��]�Sw��C���Az��tq��b9C�ۼ��y�� }�r���!�}����0�K�Z�A��/��A���8Hﲜ*һ,����.��W��C�3�Ar�r�8Ƚ��8Ƚ��l���)���;̽��8P�\��hU��hM�?h�>�r}� ��3Łrpq���˹��>E�^�A�/�ār}wq�\߫8Ƚ��4q���wq�����A��,g��S��)z���C�2�8P2L�?~u��`��a�m,��������X����F���Y��F���"�막����@�~֫�����A�,����?X����)�S��)f����������OU���&�SĶ��1v��)b��?��)Իd�]�āz����w�*Իd�C���!9ā����@}H��A'��Lq��m�\,[1q�l��a��Tq��z+M&o[��0y��x�s�>;1S!&	[	���°�T��ܶ��Cn3� ,u��BL�6�
1yج)�b����͆BL$6�7���B (��BL*6/
1���b������U (�7��hl�b���P���o>bR�y(��p�T���V���q������BL��z�<c���٭v��Si�C!暾թsO�j(�����[+QC3�����B�a����f��Tg���g��Qh�A�����Lݧ��}u���qc�*n|�G������"��D
�|��#����"��9��
��/eݯ_1o��Ө��}�c�;b���#����3H��v���� s�$�mG��|���/�r�      �   3  x���Mo�6��̯�ao����F���,�ؽ셍�H�$��"��3)�JX0��p8#>��;/yG9Td_����y�8d)y�$��,,�<K��SJ�!�>�UH4��ߪ�p�G�D��0�P?�&�[t�<\�D�`���$���ȟݡK:���'i�%�����y<�d�-p�iH<�����/~Q�'�}�&ȣe`��!��wپCc�!�Cn�`'�')��
�c/�J�2�̀9�b����z$_�.X2��Q0����^�j��O����,�P����)�`J����6��ˈTi��Y�Xs*&z��[2�Ep��]��^׻0Y��\�ɕz���k}�EK�u�Ra� ���|%�UEDF�b�^��jۧ+]��d�ˉ�yped׉��IoX�4dP��Y��4���z��%��L�QwN�*Yf5�M��=�r�Qʋ8���CUc��f!K�4�AEDG���]�����+_��T��	UxP�AJx��k+z,��W��Z�NrK{�ɦ��0l�bS�����*�^tG�x����Q��Ȇ��U?��Ũ���O�X����5��zp1J��J�݋��j~�!MCN�+5Z1��b~`1�'��Fٯ���g:�g؜ḣ��]��^,)��,S��.�zq0�k@��f|Ɣà��w��e�7��`�q>Ŭ�n���͸�z���e063�B'��\}��%�����_(a_�/z\�-ӂ��B��֜b�V����|h�SG��hp�<%���S�B���n����{ZUrf��b!�l�R
^�G�l$/K��j�����Z��nA�?#v̘	��BrZ�L{u3r��:+�URfb2���]�`��u[G�X���qyY�oUX��o�.U�ӣ�l:CǨ��m�K�Y�74.�O��:.�3{��;�(��8e�sPO�r��`l�Nc1�ܫS	#�3�ܢ���˖�b�A�Zߡ,U��Ժ*��RY,�g��[�Y��f��ʶR��)�pR�oiw¦S�}���'�<�˴z`}������}&     