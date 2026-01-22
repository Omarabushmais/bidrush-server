--
-- PostgreSQL database dump
--

\restrict gN7duPk7l6WoaB7EQQkCVvk5bTfu690y0zp2SmPxgKvtJysCP1fz5VoY2Hi2ccN

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-22 11:50:54

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 16503)
-- Name: auction_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auction_images (
    id integer NOT NULL,
    auction_id integer NOT NULL,
    image_url text NOT NULL
);


ALTER TABLE public.auction_images OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16502)
-- Name: auction_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auction_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auction_images_id_seq OWNER TO postgres;

--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 225
-- Name: auction_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auction_images_id_seq OWNED BY public.auction_images.id;


--
-- TOC entry 222 (class 1259 OID 16452)
-- Name: auctions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auctions (
    id integer NOT NULL,
    seller_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    category character varying(50),
    starting_price numeric(10,2) NOT NULL,
    current_price numeric(10,2) NOT NULL,
    bid_increment numeric(10,2) NOT NULL,
    status character varying(15) DEFAULT 'active'::character varying NOT NULL,
    start_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_time timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT auctions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'ended'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.auctions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16451)
-- Name: auctions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auctions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auctions_id_seq OWNER TO postgres;

--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 221
-- Name: auctions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auctions_id_seq OWNED BY public.auctions.id;


--
-- TOC entry 224 (class 1259 OID 16480)
-- Name: bids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bids (
    id integer NOT NULL,
    auction_id integer NOT NULL,
    bidder_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status character varying(20) DEFAULT 'Outbid'::character varying NOT NULL,
    CONSTRAINT check_bid_status CHECK (((status)::text = ANY ((ARRAY['Winning'::character varying, 'Win'::character varying, 'Outbid'::character varying])::text[])))
);


ALTER TABLE public.bids OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16479)
-- Name: bids_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bids_id_seq OWNER TO postgres;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 223
-- Name: bids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bids_id_seq OWNED BY public.bids.id;


--
-- TOC entry 220 (class 1259 OID 16424)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    fullname character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    phone_number character varying(20),
    role character varying(10) DEFAULT 'user'::character varying NOT NULL,
    status character varying(10) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16423)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4882 (class 2604 OID 16506)
-- Name: auction_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auction_images ALTER COLUMN id SET DEFAULT nextval('public.auction_images_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 16455)
-- Name: auctions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auctions ALTER COLUMN id SET DEFAULT nextval('public.auctions_id_seq'::regclass);


--
-- TOC entry 4879 (class 2604 OID 16483)
-- Name: bids id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids ALTER COLUMN id SET DEFAULT nextval('public.bids_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 16427)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4898 (class 2606 OID 16513)
-- Name: auction_images auction_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auction_images
    ADD CONSTRAINT auction_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 16473)
-- Name: auctions auctions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auctions
    ADD CONSTRAINT auctions_pkey PRIMARY KEY (id);


--
-- TOC entry 4896 (class 2606 OID 16491)
-- Name: bids bids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_pkey PRIMARY KEY (id);


--
-- TOC entry 4888 (class 2606 OID 16450)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4890 (class 2606 OID 16446)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 16448)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4902 (class 2606 OID 16514)
-- Name: auction_images auction_images_auction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auction_images
    ADD CONSTRAINT auction_images_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;


--
-- TOC entry 4899 (class 2606 OID 16474)
-- Name: auctions auctions_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auctions
    ADD CONSTRAINT auctions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4900 (class 2606 OID 16492)
-- Name: bids bids_auction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_auction_id_fkey FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 16497)
-- Name: bids bids_bidder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_bidder_id_fkey FOREIGN KEY (bidder_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-22 11:50:54

--
-- PostgreSQL database dump complete
--

\unrestrict gN7duPk7l6WoaB7EQQkCVvk5bTfu690y0zp2SmPxgKvtJysCP1fz5VoY2Hi2ccN

