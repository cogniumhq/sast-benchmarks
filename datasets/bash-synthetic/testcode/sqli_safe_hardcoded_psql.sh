#!/bin/bash
psql -U postgres maintenance -c "VACUUM ANALYZE;"
